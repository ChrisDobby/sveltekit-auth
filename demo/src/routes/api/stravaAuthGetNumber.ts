import stravaConfig from "$lib/stravaAuthConfig";
import type { EndpointOutput } from "@sveltejs/kit";
import { authentication } from "sveltekit-auth";

const { authenticatedApi } = authentication(stravaConfig);

export const get = authenticatedApi(async (): Promise<EndpointOutput> => {
    return { status: 200, body: JSON.stringify({ number: Math.round(Math.random() * 100) }) };
});
