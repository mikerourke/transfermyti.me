/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from "qs";
import R from "ramda";
import { call, delay, put } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { API_PAGE_SIZE } from "~/constants";
import * as appActions from "~/app/appActions";
import { EntityGroup } from "~/common/commonTypes";
import { fetchArray } from "~/utils";

export function* startGroupTransfer(
  entityGroup: EntityGroup,
  countTotalInGroup: number,
): SagaIterator {
  yield put(appActions.resetCountCurrentInGroup());
  yield put(appActions.updateCurrentEntityGroup(entityGroup));
  yield put(appActions.updateCountTotalInGroup(countTotalInGroup));
}

export function* incrementTransferCounts(): SagaIterator {
  yield put(appActions.incrementCountCurrentInGroup());
  yield put(appActions.incrementCountCurrentInWorkspace());
  yield put(appActions.incrementCountCurrentOverall());
}

export function* paginatedClockifyFetch<TEntity>(apiUrl: string): SagaIterator {
  let keepFetching = true;
  let currentPage = 1;

  const allEntities: TEntity[] = [];

  while (keepFetching) {
    const query = qs.stringify({
      page: currentPage,
      "page-size": API_PAGE_SIZE,
    });
    const endpoint = `${apiUrl}?${query}`;

    const entities: TEntity[] = yield call(fetchArray, endpoint);
    keepFetching = entities.length === API_PAGE_SIZE;

    allEntities.push(...entities);
    yield delay(250);
    currentPage += 1;
  }

  return R.flatten(allEntities);
}
