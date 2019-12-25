/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from "qs";
import * as R from "ramda";
import { call, delay } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { API_PAGE_SIZE, CLOCKIFY_API_DELAY } from "~/constants";
import { fetchArray } from "~/utils";
import { EntityGroup, Mapping } from "~/common/commonTypes";

export function* startGroupTransfer(
  entityGroup: EntityGroup,
  countTotalInGroup: number,
): SagaIterator {}

export function* incrementTransferCounts(): SagaIterator {}

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
    yield delay(CLOCKIFY_API_DELAY);
    currentPage += 1;
  }

  return R.flatten(allEntities);
}

export function linkEntitiesByIdByMapping<TEntity>(
  sourceRecords: TEntity[],
  targetRecords: TEntity[],
): Record<Mapping, Record<string, TEntity>> {
  if (sourceRecords.length === 0) {
    return {
      source: {},
      target: {},
    };
  }

  return {
    source: linkForMappingByName(targetRecords, sourceRecords),
    target: linkForMappingByName(sourceRecords, targetRecords),
  };
}

function linkForMappingByName<TEntity>(
  linkFromRecords: TEntity[],
  recordsToUpdate: TEntity[],
): Record<string, TEntity> {
  type LinkableRecord = TEntity & { name: string; id: string };

  const linkFromEntitiesByName = (linkFromRecords as LinkableRecord[]).reduce(
    (acc, record) => ({
      ...acc,
      [record.name]: record,
    }),
    {},
  );

  const linkedRecordsById = {};
  for (const recordToUpdate of recordsToUpdate as LinkableRecord[]) {
    const linkedId = R.pathOr(
      null,
      [recordToUpdate.name, "id"],
      linkFromEntitiesByName,
    );

    linkedRecordsById[recordToUpdate.id] = {
      ...recordToUpdate,
      linkedId,
      isIncluded: R.isNil(linkedId),
    };
  }

  return linkedRecordsById;
}
