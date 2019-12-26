/* eslint-disable @typescript-eslint/no-explicit-any */
import qs from "qs";
import * as R from "ramda";
import { call, delay, put, select } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import {
  API_PAGE_SIZE,
  CLOCKIFY_API_DELAY,
  TOGGL_API_DELAY,
} from "~/constants";
import { fetchArray } from "~/utils";
import { incrementCurrentTransferCount } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import {
  selectInlcudedWorkspaceIdsByMapping,
  selectTargetWorkspaceId,
} from "~/workspaces/workspacesSelectors";
import { Mapping, ToolName } from "~/common/commonTypes";

export function* createEntitiesForTool<TEntity>({
  toolName,
  sourceRecords,
  creatorFunc,
}: {
  toolName: ToolName;
  sourceRecords: TEntity[];
  creatorFunc: (sourceRecord: any, workspaceId: string) => SagaIterator<any>;
}): SagaIterator<TEntity[]> {
  const targetRecords: TEntity[] = [];
  const apiDelay = apiDelayForTool(toolName);

  for (const sourceRecord of sourceRecords) {
    const targetWorkspaceId = yield select(
      selectTargetWorkspaceId,
      sourceRecord,
    );
    if (R.isNil(targetWorkspaceId)) {
      continue;
    }

    yield put(incrementCurrentTransferCount());

    const targetRecord = yield call(
      creatorFunc,
      sourceRecord,
      targetWorkspaceId,
    );
    if (!R.isNil(targetRecord)) {
      targetRecords.push(targetRecord);
    }

    yield delay(apiDelay);
  }

  return targetRecords;
}

export function* fetchEntitiesForTool<TEntity>({
  toolName,
  fetchFunc,
}: {
  toolName: ToolName;
  fetchFunc: (workspaceId: string) => SagaIterator<TEntity[]>;
}): SagaIterator<TEntity[]> {
  const workspaceIdsByMapping = yield select(
    selectInlcudedWorkspaceIdsByMapping,
  );
  const toolMapping = yield select(selectToolMapping, toolName);
  const workspaceIds = R.propOr(
    [],
    toolMapping,
  )(workspaceIdsByMapping) as string[];

  if (workspaceIds.length === 0) {
    return [];
  }

  const allRecords: TEntity[] = [];
  const apiDelay = apiDelayForTool(toolName);

  for (const workspaceId of workspaceIds) {
    const workspaceRecords: TEntity[] = yield call(fetchFunc, workspaceId);
    allRecords.push(...workspaceRecords);

    yield delay(apiDelay);
  }

  return allRecords;
}

function apiDelayForTool(toolName: ToolName): number {
  return {
    [ToolName.Clockify]: CLOCKIFY_API_DELAY,
    [ToolName.Toggl]: TOGGL_API_DELAY,
  }[toolName];
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
