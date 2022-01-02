import stravaConfig from "$lib/stravaAuthConfig";
import { authentication } from "sveltekit-auth";

const { authenticated } = authentication(stravaConfig);

export const get = authenticated;
