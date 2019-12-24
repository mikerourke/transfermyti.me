export function getIfDev(): boolean {
  try {
    // @ts-ignore
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv) {
      return false;
    }

    return nodeEnv.toString() === "development";
  } catch (err) {
    return false;
  }
}
