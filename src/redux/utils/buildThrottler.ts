import PromiseThrottle from 'promise-throttle';

export default function buildThrottler<TResponse>(
  fetchFn: (...fetchArgs: any[]) => TResponse,
) {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 4,
    promiseImplementation: Promise,
  });

  const throttledFn = (...args: any[]) =>
    new Promise((resolve, reject) =>
      fetchFn
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
    throttledFn,
  };
}
