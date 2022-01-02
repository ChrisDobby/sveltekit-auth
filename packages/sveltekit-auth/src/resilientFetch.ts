const wait = (milliseconds: number): Promise<void> => new Promise(resolve => setTimeout(resolve, milliseconds));
const NO_RETRY_STATUSES = [400, 401, 409];

const resilientFetch =
    (fetchFunc: (info: RequestInfo, init?: RequestInit) => Promise<Response>, maxRetries = 3, retryDelay = 1000) =>
    async (info: RequestInfo, init?: RequestInit): Promise<Response> => {
        const tryFetch = async (retries: number): Promise<Response> => {
            try {
                const response = await fetchFunc(info, init);
                if (!response.ok && !NO_RETRY_STATUSES.includes(response.status) && retries) {
                    await wait(retryDelay);
                    return tryFetch(retries - 1);
                }

                return response;
            } catch (err) {
                if (!retries) {
                    throw err;
                }
                await wait(retryDelay);
                return tryFetch(retries - 1);
            }
        };

        return tryFetch(maxRetries);
    };

export default resilientFetch;
