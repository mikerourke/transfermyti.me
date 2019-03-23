import PromiseThrottle from 'promise-throttle';

export default function buildThrottler<TResponse>(
  fetchFunc: (...fetchArgs: any[]) => TResponse,
) {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 4,
    promiseImplementation: Promise,
  });

  const throttledFunc = (...args: any[]) =>
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
