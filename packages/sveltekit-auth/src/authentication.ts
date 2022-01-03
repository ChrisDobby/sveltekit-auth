import type { EndpointOutput, LoadInput, Load, Page, Handle, GetSession, Request } from "@sveltejs/kit";
import type { ServerRequest } from "@sveltejs/kit/types/hooks";
import cookie from "cookie";
import { getAuthUrl, getTokenFetchArgs } from "./config";
import type { Config, RetrieveTokenArgs } from "./types";
import resilientFetch from "./resilientFetch";

type Auth = {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    scope: string;
};

type Api = (request: ServerRequest, args?: any) => Promise<EndpointOutput>;

const f = resilientFetch(fetch);

function getHostUrl(page: Page) {
    return `${page.host.startsWith("localhost") ? "http" : "https"}://${page.host}`;
}

function getRedirectUri(page: Page) {
    return `${getHostUrl(page)}/api/authenticated?redirect_to=${page.path}`;
}

export const authentication = (config: Config) => {
    const accessTokenCookieName = `${config.provider}_access_token`;
    const refreshTokenCookieName = `${config.provider}_refresh_token`;
    const tokenPropName = `${config.provider}Token`;

    const getCookies = (auth: Auth): string[] => {
        const cookies = [
            cookie.serialize(accessTokenCookieName, auth.access_token, {
                path: "/",
                httpOnly: true,
                expires: new Date(auth.expires_at * 1000),
            }),
            cookie.serialize(refreshTokenCookieName, JSON.stringify({ token: auth.refresh_token, scope: auth.scope }), {
                path: "/",
                httpOnly: true,
            }),
        ];

        return cookies.concat(config.getCustomCookies ? config.getCustomCookies(auth) : []);
    };

    const retrieveToken = async (args: RetrieveTokenArgs): Promise<Auth> => {
        const { scope } = args;
        const [url, init] = getTokenFetchArgs(config, args);
        const authResponse = await f(url, init);
        const response = await authResponse.json();

        return {
            ...response,
            scope,
        };
    };

    const authenticatedApi =
        (api: Api): Api =>
        async (request, args) => {
            const { locals } = request;

            if (!locals[tokenPropName]) {
                return { status: 401 };
            }

            return api(request, args);
        };

    const authenticatedPage =
        (loader: Load): Load =>
        async (args: LoadInput) => {
            const { session, page } = args;

            const token = session[tokenPropName];
            if (token) {
                return loader(args);
            }

            const authUrl = getAuthUrl(config, getRedirectUri(page));

            return {
                status: 302,
                redirect: authUrl,
            };
        };

    const authenticated = async ({ query }: ServerRequest): Promise<EndpointOutput> => {
        try {
            const code = query.get("code");
            const scope = query.get("scope");
            const redirect = query.get("redirect_to");

            if (!code || !scope) {
                return {
                    headers: { Location: "/" },
                    status: 302,
                };
            }

            const token = await retrieveToken({ code, scope });
            return {
                headers: {
                    "Set-Cookie": getCookies(token),
                    Location: redirect || "/",
                },
                status: 302,
            };
        } catch (error) {
            return {
                headers: { Location: "/" },
                status: 302,
            };
        }
    };

    const authenticatedHandle = (handle: Handle) => async args => {
        const { request, resolve } = args;
        const cookies = cookie.parse(request.headers.cookie || "");
        const accessToken = cookies[accessTokenCookieName];
        const refreshToken = cookies[refreshTokenCookieName];

        let refreshed: Auth | null = null;
        if (accessToken) {
            request.locals = {
                ...request.locals,
                [tokenPropName]: accessToken,
            };
        } else if (refreshToken) {
            const { token, scope } = JSON.parse(refreshToken);
            refreshed = await retrieveToken({ refreshToken: token, scope });
            request.locals = {
                ...request.locals,
                [tokenPropName]: refreshed.access_token,
            };
        }

        const authenticatedResolve = async req => {
            const response = await resolve(req);
            if (refreshed) {
                response.headers["Set-Cookie"] = getCookies(refreshed);
            }

            return response;
        };

        return handle({ ...args, resolve: authenticatedResolve });
    };

    const authenticatedSession = (getSession: GetSession) => (request: Request) => {
        const session = request.locals[tokenPropName] ? { [tokenPropName]: request.locals[tokenPropName] } : {};
        return { ...session, ...getSession(request) };
    };

    const logout = (redirectUri?: string) => async (): Promise<EndpointOutput> => {
        const cookies = [
            cookie.serialize(accessTokenCookieName, null, { path: "/", httpOnly: true, maxAge: 0 }),
            cookie.serialize(refreshTokenCookieName, null, { path: "/", httpOnly: true, maxAge: 0 }),
        ];

        return {
            headers: {
                "Set-Cookie": cookies,
                Location: redirectUri || "/",
            },
            status: 302,
        };
    };

    return { authenticatedPage, authenticatedApi, authenticated, authenticatedHandle, authenticatedSession, logout };
};
