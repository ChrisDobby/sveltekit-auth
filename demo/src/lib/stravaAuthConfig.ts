import { AuthProvider } from "sveltekit-auth";
import type { Config } from "sveltekit-auth";
import cookie from "cookie";

const getCustomCookies = (token: { athlete?: object }): string[] => {
    const { athlete } = token;
    return athlete ? [cookie.serialize("strava_athlete", JSON.stringify(athlete), { path: "/", httpOnly: true })] : [];
};

const stravaConfig: Config = {
    provider: AuthProvider.Strava,
    clientId: process.env.STRAVA_CLIENT_ID,
    clientSecret: process.env.STRAVA_CLIENT_SECRET,
    scope: "activity:read_all,profile:read_all",
    getCustomCookies,
};

export default stravaConfig;
