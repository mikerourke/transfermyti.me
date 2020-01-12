import { SagaIterator } from "@redux-saga/types";
import qs from "qs";
import * as R from "ramda";
import { call, delay } from "redux-saga/effects";
import {
  CLOCKIFY_API_DELAY,
  CLOCKIFY_API_PAGE_SIZE,
  TOGGL_API_DELAY,
} from "~/constants";
import { ToolName } from "~/typeDefs";

/**
 * Several Clockify endpoints support passing in a page size and page number
 * as query params to the API fetch call. To ensure we're getting all the
 * records associated with an entity group, this function keeps fetching
 * pages and stops when the request returns either zero records or a record
 * count less than the page size.
 */
export function* fetchPaginatedFromClockify<TEntity>(
  apiUrl: string,
  queryParams: object = {},
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

    yield delay(CLOCKIFY_API_DELAY);
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
  return R.isNil(response) ? [] : response;
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
  return R.isNil(response) ? {} : response;
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
    return await fetch(endpoint, fetchOptions as RequestInit);
  } catch (err) {
    if (err.status === 429) {
      if (attempt <= 0) {
        throw new Error("Maximum API request attempts reached");
      }

      // Most API services allow at least 1 request per second. If we encounter
      // a tool that doesn't adhere to this standard, we may have to make this
      // tool-specific. I added a 200ms cushion to ensure we don't max out
      // our attempts because of a time disparity:
      await delay(1_200);
      return await fetchWithRetries(endpoint, fetchOptions, attempt - 1);
    } else {
      throw err;
    }
  }
}

/**
 * Returns the delay to use for making API requests based on the specified
 * tool name.
 */
export function getApiDelayForTool(toolName: ToolName): number {
  return {
    [ToolName.Clockify]: CLOCKIFY_API_DELAY,
    [ToolName.Toggl]: TOGGL_API_DELAY,
  }[toolName];
}
