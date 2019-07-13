/**
 * Pauses execution for the specified delayInMs argument.
 */
export function pause(delayInMs: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, delayInMs);
  });
}
