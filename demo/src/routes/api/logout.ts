import stravaConfig from "$lib/stravaAuthConfig";
import { authentication } from "sveltekit-auth";

const { logout } = authentication(stravaConfig);

export const get = logout();
