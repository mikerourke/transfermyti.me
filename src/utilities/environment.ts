import { ToolName } from "~/typeDefs";

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

export type TogglApiContext = "api" | "reports";

/**
 * Returns the base URL to prefix the endpoint based on the specified tool
 * name and Toggl API context (e.g. reports).
 */
export function getApiUrl(
  toolName: ToolName,
  togglApiContext: TogglApiContext,
): string {
  if (isUseLocalApi()) {
    const apiPort = process?.env?.TMT_LOCAL_API_PORT ?? "9009";

    return `http://localhost:${apiPort}/api/${toolName}`;
  }

  if (toolName === ToolName.Clockify) {
    return "https://api.clockify.me/api/v1";
  }

  return togglApiContext === "reports"
    ? "https://api.track.toggl.com/reports/api/v2"
    : "https://api.track.toggl.com/api/v8";
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
