<script context="module" lang="ts">
    import stravaConfig from "$lib/stravaAuthConfig";
    import { authentication } from "sveltekit-auth";
    import { session } from "$app/stores";

    const stravaAuth = authentication(stravaConfig);

    export const load = stravaAuth.authenticatedPage(() => {
        return { props: { authenticated: true } };
    });
</script>

<script lang="ts">
    let number;
    const getNumberClick = async () => {
        const response = await fetch("/api/stravaAuthGetNumber");
        if (response.ok) {
            number = (await response.json()).number;
        }
    };
</script>

<div>Authenticated with Strava</div>
<div>{`token = ${$session.token}`}</div>
<pre><code>{JSON.stringify($session.athlete, null, 2)}</code></pre>

<button on:click={getNumberClick}>Get number</button>
<span>{number}</span>
<a rel="external" href="/api/logout">Logout</a>
