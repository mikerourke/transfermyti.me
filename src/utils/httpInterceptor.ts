import fetchIntercept from "fetch-intercept";
import { Store } from "redux";
import {
  CLOCKIFY_API_URL,
  LOCAL_API_URL,
  TOGGL_API_URL,
  TOGGL_REPORTS_URL,
} from "~/constants";
import { ToolName } from "~/commonTypes";
import { CredentialsModel } from "~/credentials/credentialsTypes";

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

      const { credentials } = store.getState();

      if (config.body) {
        config.body = JSON.stringify(config.body);
      }

      const baseHeaders = getHeaders(toolName, credentials);
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
        const toolName = response.url.includes("clockify")
          ? ToolName.Clockify
          : ToolName.Toggl;

        const { url, status, statusText } = response;

        return response
          .json()
          .then((result: object) => Promise.reject({ ...result, toolName }))
          .catch(() => Promise.reject({ url, status, statusText, toolName }));
      }
      const type = response.headers.get("content-type") || "json";
      if (type.includes("json")) {
        return response.json();
      }
      return response.text();
    },
  });
}

function getHeaders(
  toolName: ToolName,
  credentials: CredentialsModel,
): Record<string, string> {
  if (toolName === ToolName.Clockify) {
    return {
      "Content-Type": "application/json",
      "X-Api-Key": credentials.clockifyApiKey,
    };
  }

  const authString = `${credentials.togglApiKey}:api_token`;
  const encodedAuth = Buffer.from(authString).toString("base64");
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
  if (process.env.USE_LOCAL_API === "true" || process.env.NODE_ENV === "test") {
    return `${LOCAL_API_URL}/${toolName}`;
  }

  if (toolName === ToolName.Clockify) {
    return CLOCKIFY_API_URL;
  }

  return context === Context.Reports ? TOGGL_REPORTS_URL : TOGGL_API_URL;
}
