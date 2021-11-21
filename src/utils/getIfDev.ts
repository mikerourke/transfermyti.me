/**
 * Returns true if in development mode.
 */
export function getIfDev(): boolean {
  /* istanbul ignore next: this doesn't impact the user at all */
  try {
    // @ts-ignore
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv) {
      return false;
    }

    return nodeEnv.toString() === "development";
  } catch {
    return false;
  }
}
