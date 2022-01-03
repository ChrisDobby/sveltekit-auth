import { Config, AuthProvider, RetrieveTokenArgs } from "./types";
import * as stravaConfig from "./stravaConfig";

const providers = {
    [AuthProvider.Strava]: stravaConfig,
};

export function getAuthUrl(config: Config, redirectUri: string): string {
    return providers[config.provider].authUrl(config, redirectUri);
}

export function getTokenFetchArgs(
    config: Config,
    { code, refreshToken }: RetrieveTokenArgs,
): [RequestInfo, RequestInit] | null {
    return providers[config.provider].tokenFetchArgs(config, code, refreshToken);
}
