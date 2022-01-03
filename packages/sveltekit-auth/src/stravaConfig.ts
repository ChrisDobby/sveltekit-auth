import type { StravaConfig } from "./types";

const STRAVA_AUTHORISE_URL = process.env.STRAVA_AUTHORISE_URL || "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = process.env.STRAVA_TOKEN_URL || "https://www.strava.com/oauth/token";

export const authUrl = (config: StravaConfig, redirectUri: string) =>
    `${STRAVA_AUTHORISE_URL}?client_id=${config.clientId}&redirect_uri=${redirectUri}&response_type=code&approval_prompt=auto&scope=${config.scope}`;

export const tokenFetchArgs = (
    config: StravaConfig,
    code: string,
    refreshToken?: string,
): [RequestInfo, RequestInit] => {
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
};
