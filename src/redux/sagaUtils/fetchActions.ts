import { SagaIterator } from "@redux-saga/types";
import qs from "qs";
import * as R from "ramda";
import { call, delay } from "redux-saga/effects";
import {
  CLOCKIFY_API_PAGE_SIZE,
  CLOCKIFY_API_DELAY,
  TOGGL_API_DELAY,
} from "~/constants";
import { ToolName } from "~/allEntities/allEntitiesTypes";

export function* paginatedClockifyFetch<TEntity>(
  apiUrl: string,
  queryParams: object = {},
): SagaIterator<TEntity[]> {
  let keepFetching = true;
  let currentPage = 1;

  const allEntities: TEntity[] = [];

  while (keepFetching) {
    const query = qs.stringify({
      page: currentPage,
      "page-size": CLOCKIFY_API_PAGE_SIZE,
      ...queryParams,
    });
    const endpoint = `${apiUrl}?${query}`;

    const entities: TEntity[] = yield call(fetchArray, endpoint);
    keepFetching = entities.length === CLOCKIFY_API_PAGE_SIZE;

    allEntities.push(...entities);
    yield delay(CLOCKIFY_API_DELAY);
    currentPage += 1;
  }

  return allEntities;
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
 * Ensures a valid object is returned from a fetch call.
 */
export function* fetchObject<TResponse>(
  endpoint: string,
  fetchOptions: unknown = {},
): SagaIterator<TResponse> {
  const response = yield call(fetchWithRetries, endpoint, fetchOptions);
  return R.isNil(response) ? {} : response;
}

async function fetchWithRetries<TResponse>(
  endpoint: string,
  fetchOptions: unknown,
  attempt: number = 5,
): Promise<TResponse> {
  try {
    return await fetch(endpoint, fetchOptions as RequestInit);
  } catch (err) {
    if (err.status === 429) {
      // This is an arbitrary delay to ensure the API limits aren't reached.
      // Eventually we can make this tool specific:
      await delay(750);
      return await fetchWithRetries(endpoint, fetchOptions, attempt - 1);
    } else {
      throw err;
    }
  }
}

export function getApiDelayForTool(toolName: ToolName): number {
  return {
    [ToolName.Clockify]: CLOCKIFY_API_DELAY,
    [ToolName.Toggl]: TOGGL_API_DELAY,
  }[toolName];
}
