import fetchIntercept from "fetch-intercept";
import { Store } from "redux";

import { credentialsByToolNameSelector } from "~/modules/credentials/credentialsSelectors";
import { ToolName } from "~/typeDefs";
import { getApiUrl, TogglApiContext } from "~/utilities/environment";

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
    response(response): AnyValid {
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
function extrapolateFromUrl(url: string): {
  toolName: ToolName;
  context: TogglApiContext;
  endpoint: string;
} {
  const validUrl = url.startsWith("/") ? url.substring(1) : url;
  const [toolName, context, ...rest] = validUrl.split("/");

  return {
    toolName: toolName as ToolName,
    context: context as TogglApiContext,
    endpoint: rest.join("/"),
  };
}
