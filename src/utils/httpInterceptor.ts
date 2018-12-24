import fetchIntercept from 'fetch-intercept';
import { Store } from 'redux';
import {
  CLOCKIFY_API_URL,
  TOGGL_API_URL,
  TOGGL_REPORTS_URL,
} from '../constants';
import { ToolName } from '../types/common';
import { CredentialsModel } from '../types/credentials';

enum Context {
  Api = 'api',
  Reports = 'reports',
}

interface RequestConfig {
  body?: any;
  headers?: Record<string, string>;
}

const getHeaders = (toolName: ToolName, credentials: CredentialsModel) => {
  if (toolName === ToolName.Clockify) {
    return {
      'Content-Type': 'application/json',
      'X-Api-Key': credentials.clockifyApiKey,
    };
  }

  const authString = `${credentials.togglApiKey}:api_token`;
  const encodedAuth = Buffer.from(authString).toString('base64');
  return {
    'Content-Type': 'application/json',
    Authorization: `Basic ${encodedAuth}`,
  };
};

const extrapolateFromUrl = (
  url: string,
): { toolName: ToolName; context: Context; endpoint: string } => {
  const validUrl = url.startsWith('/') ? url.substring(1) : url;
  const [toolName, context, ...rest] = validUrl.split('/');

  return {
    toolName: toolName as ToolName,
    context: context as Context,
    endpoint: rest.join('/'),
  };
};

const getApiUrl = (toolName: ToolName, context: Context): string => {
  if (toolName === ToolName.Clockify) {
    return CLOCKIFY_API_URL;
  }

  return context === Context.Reports ? TOGGL_REPORTS_URL : TOGGL_API_URL;
};

export default (store: Store) =>
  fetchIntercept.register({
    request(url, config: RequestConfig = {}) {
      const { toolName, context, endpoint } = extrapolateFromUrl(url);

      const { credentials } = store.getState();

      if (config.body) config.body = JSON.stringify(config.body);

      const baseHeaders = getHeaders(toolName, credentials);
      if (config.headers) {
        config.headers = {
          ...config.headers,
          ...baseHeaders,
        };
      } else {
        config.headers = baseHeaders;
      }

      const fullUrl = getApiUrl(toolName, context).concat('/', endpoint);

      return [fullUrl, config];
    },
    response(response): any {
      if (!response.ok) {
        const toolName = response.url.includes('clockify')
          ? ToolName.Clockify
          : ToolName.Toggl;

        return response
          .json()
          .then(result => Promise.reject({ ...result, toolName }))
          .catch(() => Promise.reject({ ...response, toolName }));
      }
      const type = response.headers.get('content-type') || 'json';
      if (type.includes('json')) {
        return response.json();
      }
      return response.text();
    },
  });
