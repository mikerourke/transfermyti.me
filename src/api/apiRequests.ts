import { isNil } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, delay, select } from "redux-saga/effects";

import { credentialsByToolNameSelector } from "~/redux/credentials/credentialsSelectors";
import { ToolName } from "~/types";
import { isTestingMode, isUseLocalApi } from "~/utilities/environment";

const CLOCKIFY_API_PAGE_SIZE = 100;

type TogglApiContext = "api" | "reports";

/**
 * Several Clockify endpoints support passing in a page size and page number
 * as query params to the API fetch call. To ensure we're getting all the
 * records associated with an entity group, this function keeps fetching
 * pages and stops when the request returns either zero records or a record
 * count less than the page size.
 */
export function* fetchPaginatedFromClockify<TEntity>(
  apiUrl: string,
  queryParams: Dictionary<boolean | number | string> = {},
): SagaIterator<TEntity[]> {
  let keepFetching = true;

  let currentPage = 1;

  const allEntityRecords: TEntity[] = [];

  while (keepFetching) {
    const allParams = {
      page: currentPage.toString(),
      "page-size": CLOCKIFY_API_PAGE_SIZE.toString(),
    };

    for (const [key, value] of Object.entries(queryParams)) {
      const keyValue = key as keyof typeof allParams;

      allParams[keyValue] = value.toString();
    }

    const query = new URLSearchParams(allParams).toString();

    const endpoint = `${apiUrl}?${query}`;

    const entityRecords: TEntity[] = yield call(fetchArray, endpoint);

    allEntityRecords.push(...entityRecords);

    // The record count = maximum page size, which means there are either
    // additional records that need to be fetched _or_ this is the last
    // page and the record count is evenly divisible by the page size:
    keepFetching = entityRecords.length === CLOCKIFY_API_PAGE_SIZE;

    const clockifyFetchDelay = yield call(
      getApiDelayForTool,
      ToolName.Clockify,
    );

    yield delay(clockifyFetchDelay);

    currentPage += 1;
  }

  return allEntityRecords;
}

/**
 * Ensures a valid array is returned from a fetch call.
 */
export function* fetchArray<TResponse>(
  endpoint: string,
  fetchOptions: unknown = {},
): SagaIterator<TResponse> {
  const response = yield call(fetchWithRetries, endpoint, fetchOptions);

  return isNil(response) ? [] : response;
}

/**
 * Performs a fetch call when the expected payload is empty.
 */
export function* fetchEmpty(
  endpoint: string,
  fetchOptions: unknown = {},
): SagaIterator {
  yield call(fetchWithRetries, endpoint, fetchOptions);
}

/**
 * Ensures a valid object is returned from a fetch call.
 */
export function* fetchObject<TResponse>(
  endpoint: string,
  fetchOptions: unknown = {},
): SagaIterator<TResponse> {
  const response = yield call(fetchWithRetries, endpoint, fetchOptions);

  return isNil(response) ? {} : response;
}

/**
 * Attempts to make a fetch call to the specified endpoint. If the response
 * returns a 429 status code, the API rate limit was hit. It waits a little over
 * a second and tries again. If after 5 attempts, the fetch call was
 * unsuccessful, throw an error.
 */
function* fetchWithRetries<TResponse>(
  endpoint: string,
  fetchOptions: unknown,
  attempt: number = 5,
): SagaIterator<TResponse> {
  try {
    return yield call(fetchFromApi, endpoint, fetchOptions as RequestInit);
  } catch (err: AnyValid) {
    if (err.status === 429) {
      if (attempt <= 0) {
        throw new Error("Maximum API request attempts reached");
      }

      // Most API services allow at least 1 request per second. If we encounter
      // a tool that doesn't adhere to this standard, we may have to make this
      // tool-specific. Just to hedge my bets, I'm using a 3-second delay:
      yield delay(3_000);

      return yield call(fetchWithRetries, endpoint, fetchOptions, attempt - 1);
    } else {
      throw err;
    }
  }
}

/**
 * Delay time for requests to ensure rate limits are not exceeded.
 * For Clockify, the documentation limits requests to 10 per second, but we're
 * using a higher delay to accommodate for differences between the working API
 * and stable API.
 */
export function getApiDelayForTool(toolName: ToolName): number {
  switch (toolName) {
    case ToolName.Clockify:
      return isUseLocalApi() ? 0 : 1000 / 8;

    case ToolName.Toggl:
      return isUseLocalApi() ? 0 : 1000 / 4;

    default:
      return 0;
  }
}

function* fetchFromApi<T>(url: string, config: RequestInit): SagaIterator<T> {
  const { toolName, context, endpoint } = yield call(extrapolateFromUrl, url);

  const credentialsByToolName = yield select(credentialsByToolNameSelector);

  const apiKey = credentialsByToolName[toolName]?.apiKey ?? "";

  if (config.body) {
    config.body = JSON.stringify(config.body);
  }

  const baseHeaders = yield call(getHeaders, toolName, apiKey);
  if (config.headers) {
    config.headers = {
      ...config.headers,
      ...baseHeaders,
    };
  } else {
    config.headers = baseHeaders;
  }

  const rootUrl = yield call(getApiUrl, toolName, context);

  const fullUrl = rootUrl.concat("/", endpoint);

  const response = yield call(fetch, fullUrl, config);

  if (!response.ok) {
    throw new ApiError(toolName, response);
  }

  const type = response.headers.get("content-type") ?? null;

  if (type === null) {
    return response as unknown as T;
  }

  if (type.includes("json")) {
    try {
      return yield response.json();
    } catch (err: AnyValid) {
      if (/unexpected end of JSON input/gi.test(err.message)) {
        return {} as unknown as T;
      }
    }
  }

  const textValue = yield response.text();

  return textValue as unknown as T;
}

/**
 * Returns the headers with correct authentication based on the specified
 * tool name.
 */
function getHeaders(toolName: ToolName, apiKey: string): Dictionary<string> {
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

/**
 * Returns the base URL to prefix the endpoint based on the specified tool
 * name and Toggl API context (e.g. reports).
 */
function getApiUrl(
  toolName: ToolName,
  togglApiContext: TogglApiContext,
): string {
  if (isUseLocalApi() || isTestingMode()) {
    const apiPort = __LOCAL_API_PORT__ ?? "9009";

    return `http://localhost:${apiPort}/api/${toolName}`;
  }

  if (toolName === ToolName.Clockify) {
    return "https://api.clockify.me/api/v1";
  }

  return togglApiContext === "reports"
    ? "https://api.track.toggl.com/reports/api/v2"
    : "https://api.track.toggl.com/api/v9";
}

export class ApiError extends Error {
  readonly #toolName: ToolName;
  readonly #response: Response;

  constructor(toolName: ToolName, response: Response) {
    super(`API error from ${toolName} to ${response.url}: ${response.status}`);

    this.name = "ApiError";

    this.#toolName = toolName;
    this.#response = response;
  }

  public get headers(): Headers {
    return this.#response.headers;
  }

  public get statusCode(): number {
    return this.#response.status;
  }

  public get statusText(): string {
    return this.#response.statusText;
  }

  public get url(): string {
    return this.#response.url;
  }

  public get toolName(): ToolName {
    return this.#toolName;
  }

  public toJson(): Record<string, any> {
    const headers: Record<string, string> = {};

    // We don't want this to blow up the app if it fails:
    try {
      // @ts-ignore
      for (const [name, value] of this.#response.headers) {
        headers[name] = value;
      }
    } catch {
      // Do nothing.
    }

    return {
      statusCode: this.statusCode,
      statusText: this.statusText,
      url: this.url,
      headers,
    };
  }
}
