export enum AuthProvider {
    Strava = "strava",
}

export type StravaConfig = {
    provider: AuthProvider.Strava;
    clientId: string;
    clientSecret: string;
    scope: string;
    getCustomCookies?: (token: any) => string[];
};

export type Config = StravaConfig;

export type RetrieveTokenArgs = {
    scope: string;
    code?: string;
    refreshToken?: string;
};
