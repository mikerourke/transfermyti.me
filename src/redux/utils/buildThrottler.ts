import PromiseThrottle from "promise-throttle";

/**
 * Utility function to provide a promiseThrottle instance for throttling
 * requests to the tool APIs.
 */
export function buildThrottler<TResponse>(
  requestsPerSecond: number,
  fetchFunc: (...fetchArgs: Array<any>) => TResponse,
) {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond,
    promiseImplementation: Promise,
  });

  const throttledFunc = (...args: Array<any>) =>
    new Promise((resolve, reject) =>
      fetchFunc
        .call(null, ...args)
        .then((response: TResponse) => {
          resolve(response);
        })
        .catch((error: Error) => {
          reject(error);
        }),
    );

  return {
    promiseThrottle,
    throttledFunc,
  };
}
