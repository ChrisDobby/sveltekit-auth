import type { GetSession, Handle, Request } from "@sveltejs/kit";
import { authentication } from "sveltekit-auth";
import stravaConfig from "$lib/stravaAuthConfig";
import cookie from "cookie";

const { authenticatedHandle, authenticatedSession } = authentication(stravaConfig);

export const handle: Handle = authenticatedHandle(async ({ request, resolve }) => {
    const { strava_athlete } = cookie.parse(request.headers.cookie || "");
    request.locals.athlete = strava_athlete ? JSON.parse(strava_athlete) : null;

    return resolve(request);
});

export const getSession: GetSession = authenticatedSession((request: Request) => {
    return { athlete: request.locals.athlete };
});
