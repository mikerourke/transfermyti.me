/* istanbul ignore file: These are just wrappers to get environment variables.  */

export function isDevelopmentMode(): boolean {
  try {
    return __ENV__ === "development";
  } catch {
    return false;
  }
}

export function isTestingMode(): boolean {
  try {
    return __ENV__ === "test";
  } catch {
    return false;
  }
}

/**
 * Returns true if we're using the local API in development.
 */
export function isUseLocalApi(): boolean {
  try {
    if (__USE_LOCAL_API__.toString() === "true") {
      return true;
    }

    return __ENV__ === "test";
  } catch {
    return false;
  }
}
