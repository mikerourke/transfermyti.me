export function getIfDev(): boolean {
  try {
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv) return false;

    return nodeEnv.toString() === 'development';
  } catch (error) {
    return false;
  }
}
