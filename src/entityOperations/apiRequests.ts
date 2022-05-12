import qs from "qs";
import { isNil } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, delay } from "redux-saga/effects";

import { credentialsByToolNameSelector } from "~/modules/credentials/credentialsSelectors";
import { ToolName } from "~/typeDefs";
import {
  getApiUrl,
  isUseLocalApi,
  TogglApiContext,
} from "~/utilities/environment";

const CLOCKIFY_API_PAGE_SIZE = 100;

/**
 * Several Clockify endpoints support passing in a page size and page number
 * as query params to the API fetch call. To ensure we're getting all the
 * records associated with an entity group, this function keeps fetching
 * pages and stops when the request returns either zero records or a record
 * count less than the page size.
 */
export function* fetchPaginatedFromClockify<TEntity>(
  apiUrl: string,
  queryParams: Dictionary<unknown> = {},
): SagaIterator<TEntity[]> {
  let keepFetching = true;

  let currentPage = 1;

  const allEntityRecords: TEntity[] = [];

  while (keepFetching) {
    const query = qs.stringify({
      page: currentPage,
      "page-size": CLOCKIFY_API_PAGE_SIZE,
      ...queryParams,
    });

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
async function fetchWithRetries<TResponse>(
  endpoint: string,
  fetchOptions: unknown,
  attempt: number = 5,
): Promise<TResponse> {
  try {
    return await fetchFromApi(endpoint, fetchOptions as RequestInit);
  } catch (err: AnyValid) {
    if (err.status === 429) {
      if (attempt <= 0) {
        throw new Error("Maximum API request attempts reached");
      }

      // Most API services allow at least 1 request per second. If we encounter
      // a tool that doesn't adhere to this standard, we may have to make this
      // tool-specific. Just to hedge my bets, I'm using a 3-second delay:
      await delay(3_000);

      return await fetchWithRetries(endpoint, fetchOptions, attempt - 1);
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

async function fetchFromApi<T>(url: string, config: RequestInit): Promise<T> {
  const { toolName, context, endpoint } = extrapolateFromUrl(url);

  const state = window.store.getState();

  const credentialsByToolName = credentialsByToolNameSelector(state);

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

  const response = await fetch(fullUrl, config);

  if (!response.ok) {
    return Promise.reject(response);
  }

  const type = response.headers.get("content-type") ?? null;

  if (type === null) {
    return response as unknown as T;
  }

  if (type.includes("json")) {
    return await response.json();
  }

  return (await response.text()) as unknown as T;
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
