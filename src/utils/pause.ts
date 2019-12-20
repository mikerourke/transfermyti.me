/**
 * Pauses execution for the specified duration in milliseconds.
 */
export function pause(duration: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
