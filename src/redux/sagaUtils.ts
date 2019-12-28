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
import { incrementCurrentTransferCount } from "~/app/appActions";
import { selectMappingForTool } from "~/app/appSelectors";
import {
  selectInlcudedWorkspaceIdsByMapping,
  selectTargetWorkspaceId,
} from "~/workspaces/workspacesSelectors";
import { BaseEntityModel, Mapping, ToolName } from "~/entities/entitiesTypes";

export function* createEntitiesForTool<TEntity>({
  toolName,
  sourceRecords,
  apiCreateFunc,
}: {
  toolName: ToolName;
  sourceRecords: TEntity[];
  apiCreateFunc: (sourceRecord: any, workspaceId: string) => SagaIterator<any>;
}): SagaIterator<TEntity[]> {
  type ValidEntity = TEntity & BaseEntityModel;
  const targetRecords: TEntity[] = [];
  const apiDelay = apiDelayForTool(toolName);

  for (const sourceRecord of sourceRecords as ValidEntity[]) {
    const targetWorkspaceId = yield select(
      selectTargetWorkspaceId,
      sourceRecord.workspaceId,
    );
    if (R.isNil(targetWorkspaceId)) {
      continue;
    }

    yield put(incrementCurrentTransferCount());

    const targetRecord = yield call(
      apiCreateFunc,
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
  apiFetchFunc,
}: {
  toolName: ToolName;
  apiFetchFunc: (workspaceId: string) => SagaIterator<TEntity[]>;
}): SagaIterator<TEntity[]> {
  const workspaceIdsByMapping = yield select(
    selectInlcudedWorkspaceIdsByMapping,
  );
  const toolMapping = yield select(selectMappingForTool, toolName);
  const workspaceIds = R.propOr<string[], Record<string, string>, string[]>(
    [],
    toolMapping,
    workspaceIdsByMapping,
  );

  if (workspaceIds.length === 0) {
    return [];
  }

  const allRecords: TEntity[] = [];
  const apiDelay = apiDelayForTool(toolName);

  for (const workspaceId of workspaceIds) {
    const workspaceRecords: TEntity[] = yield call(apiFetchFunc, workspaceId);
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

export function* paginatedClockifyFetch<TEntity>(
  apiUrl: string,
): SagaIterator<TEntity[]> {
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

function* fetchWithRetries<TResponse>(
  endpoint: string,
  fetchOptions: unknown = {},
): SagaIterator<TResponse> {
  let fetchResponse;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      fetchResponse = yield call(fetch, endpoint, fetchOptions as RequestInit);
      break;
    } catch (err) {
      if (err.code === 429) {
        yield delay(500);
      } else {
        throw new Error(err);
      }
    }
  }

  return fetchResponse;
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

  const linkFromEntitiesByName = {};
  for (const linkFromRecord of linkFromRecords as LinkableRecord[]) {
    linkFromEntitiesByName[linkFromRecord.name] = linkFromRecord;
  }

  const linkedRecordsById = {};
  for (const recordToUpdate of recordsToUpdate as LinkableRecord[]) {
    const linkedId = R.pathOr(
      null,
      [recordToUpdate.name, "id"],
      linkFromEntitiesByName,
    );

    linkedRecordsById[recordToUpdate.id] = { ...recordToUpdate, linkedId };
  }

  return linkedRecordsById;
}
