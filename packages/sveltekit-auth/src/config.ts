const STRAVA_AUTHORISE_URL = process.env.STRAVA_AUTHORISE_URL || "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = process.env.STRAVA_TOKEN_URL || "https://www.strava.com/oauth/token";

export enum AuthProvider {
    Strava = "strava",
}

type StravaConfig = {
    provider: AuthProvider.Strava;
    clientId: string;
    clientSecret: string;
    scope: string;
    getCustomCookies?: (token: any) => string[];
};

export type Config = StravaConfig;

export function getAuthUrl(config: Config, redirectUri: string): string {
    switch (config.provider) {
        case AuthProvider.Strava:
            return `${STRAVA_AUTHORISE_URL}?client_id=${config.clientId}&redirect_uri=${redirectUri}&response_type=code&approval_prompt=auto&scope=${config.scope}`;
        default:
            return "";
    }
}

export type RetrieveTokenArgs = {
    scope: string;
    code?: string;
    refreshToken?: string;
};

export function getTokenFetchArgs(
    config: Config,
    { code, refreshToken }: RetrieveTokenArgs,
): [RequestInfo, RequestInit] | null {
    switch (config.provider) {
        case AuthProvider.Strava: {
            const tokenData =
                typeof refreshToken !== "undefined"
                    ? `grant_type=refresh_token&refresh_token=${refreshToken}`
                    : `grant_type=authorization_code&code=${code}`;

            return [
                STRAVA_TOKEN_URL,
                {
                    method: "POST",
                    body: `${tokenData}&client_id=${config.clientId}&client_secret=${config.clientSecret}`,
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                },
            ];
        }
        default:
            return null;
    }
}
