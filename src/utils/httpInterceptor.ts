import fetchIntercept from "fetch-intercept";
import { Store } from "redux";
import {
  CLOCKIFY_API_URL,
  IS_USING_LOCAL_API,
  LOCAL_API_URL,
  TOGGL_API_URL,
  TOGGL_REPORTS_URL,
} from "~/constants";
import { credentialsByToolNameSelector } from "~/credentials/credentialsSelectors";
import { ToolName } from "~/typeDefs";

enum Context {
  Api = "api",
  Reports = "reports",
}

interface RequestConfig {
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Intercepts fetch requests and allows us to form the correct URL when sending
 * and automatically convert to JSON when receiving responses.
 */
export function initInterceptor(store: Store): VoidFunction {
  return fetchIntercept.register({
    request(url, config: RequestConfig = {}) {
      const { toolName, context, endpoint } = extrapolateFromUrl(url);

      const credentialsByToolName = credentialsByToolNameSelector(
        store.getState(),
      );
      const apiKey = credentialsByToolName[toolName]?.apiKey ?? "";

      if (config.body) {
        config.body = JSON.stringify(config.body);
      }

      const baseHeaders = getHeaders(toolName, apiKey);
      if (config.headers) {
        config.headers = {
          ...config.headers,
          ...baseHeaders,
        };
      } else {
        config.headers = baseHeaders;
      }

      const fullUrl = getApiUrl(toolName, context).concat("/", endpoint);
      return [fullUrl, config];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response(response): any {
      if (!response.ok) {
        return Promise.reject(response);
      }

      const type = response.headers.get("content-type") ?? null;
      if (type === null) {
        return response;
      }

      if (type.includes("json")) {
        return response.json();
      }

      return response.text();
    },
  });
}

/**
 * Returns the headers with correct authentication based on the specified
 * tool name.
 */
function getHeaders(
  toolName: ToolName,
  apiKey: string,
): Record<string, string> {
  if (toolName === ToolName.Clockify) {
    return {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    };
  }

  const authString = `${apiKey}:api_token`;
  const encodedAuth = window.btoa(authString);
  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${encodedAuth}`,
  };
}

/**
 * Extrapolates the tool name, context, and endpoint from the specified URL.
 * This allows us to specify a simpler URL for fetch requests and get the
 * tool information based on the path.
 */
function extrapolateFromUrl(
  url: string,
): { toolName: ToolName; context: Context; endpoint: string } {
  const validUrl = url.startsWith("/") ? url.substring(1) : url;
  const [toolName, context, ...rest] = validUrl.split("/");

  return {
    toolName: toolName as ToolName,
    context: context as Context,
    endpoint: rest.join("/"),
  };
}

/**
 * Returns the base URL to prefix the endpoint based on the specified tool
 * name and context (e.g. reports).
 */
function getApiUrl(toolName: ToolName, context: Context): string {
  if (IS_USING_LOCAL_API) {
    return `${LOCAL_API_URL}/${toolName}`;
  }

  if (toolName === ToolName.Clockify) {
    return CLOCKIFY_API_URL;
  }

  return context === Context.Reports ? TOGGL_REPORTS_URL : TOGGL_API_URL;
}
