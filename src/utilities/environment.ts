/* istanbul ignore file: These are just wrappers to get environment variables.  */

export function isDevelopmentMode(): boolean {
  try {
    if (process?.env?.NODE_ENV?.toString() === "development") {
      return true;
    }

    return process?.env?.WEBPACK_SERVE?.toString() === "true";
  } catch {
    return false;
  }
}

export function isTestingMode(): boolean {
  try {
    return process?.env?.NODE_ENV?.toString() === "test";
  } catch {
    return false;
  }
}

/**
 * Returns true if we're using the local API in development.
 */
export function isUseLocalApi(): boolean {
  try {
    if (process?.env?.TMT_USE_LOCAL_API?.toString() === "true") {
      return true;
    }

    return process?.env?.NODE_ENV?.toString() === "test";
  } catch {
    return false;
  }
}
