import fetchIntercept from "fetch-intercept";
import { Store } from "redux";
import {
  CLOCKIFY_API_URL,
  LOCAL_API_URL,
  TOGGL_API_URL,
  TOGGL_REPORTS_URL,
} from "~/constants";
import { credentialsByToolNameSelector } from "~/credentials/credentialsSelectors";
import { ToolName } from "~/allEntities/allEntitiesTypes";

enum Context {
  Api = "api",
  Reports = "reports",
}

interface RequestConfig {
  body?: unknown;
  headers?: Record<string, string>;
}

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
      const toolName = response.url.includes("clockify")
        ? ToolName.Clockify
        : ToolName.Toggl;
      const { url, status, statusText } = response;

      if (!response.ok) {
        const error = new Error(statusText);
        Object.assign(error, { url, status, toolName });
        throw error;
      }

      const type = response.headers.get("content-type") || "json";
      if (type.includes("json")) {
        return response
          .json()
          .then(result => result)
          .catch(err => {
            const error = new Error(err.message);
            Object.assign(error, { url, toolName });
            return Promise.reject(error);
          });
      }
      return response.text();
    },
  });
}

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

function getApiUrl(toolName: ToolName, context: Context): string {
  // @ts-ignore
  if (process.env.USE_LOCAL_API === "true" || process.env.NODE_ENV === "test") {
    return `${LOCAL_API_URL}/${toolName}`;
  }

  if (toolName === ToolName.Clockify) {
    return CLOCKIFY_API_URL;
  }

  return context === Context.Reports ? TOGGL_REPORTS_URL : TOGGL_API_URL;
}
