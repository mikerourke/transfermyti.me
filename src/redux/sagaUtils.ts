/* eslint-disable @typescript-eslint/no-explicit-any */
import { SagaIterator } from "@redux-saga/types";
import { Selector } from "reselect";
import qs from "qs";
import * as R from "ramda";
import { call, delay, put, select } from "redux-saga/effects";
import {
  CLOCKIFY_API_DELAY,
  CLOCKIFY_API_PAGE_SIZE,
  TOGGL_API_DELAY,
} from "~/constants";
import {
  incrementEntityGroupTransferCountComplete,
  updateEntityGroupTransferCountTotal,
} from "~/allEntities/allEntitiesActions";
import { mappingByToolNameSelector } from "~/app/appSelectors";
import {
  includedWorkspaceIdsByMappingSelector,
  workspaceIdToLinkedIdSelector,
} from "~/workspaces/workspacesSelectors";
import {
  BaseEntityModel,
  EntityGroup,
  Mapping,
  ToolName,
} from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";

export function* findTargetEntityId<TEntity>(
  sourceEntityId: string | null,
  sourceRecordsByIdSelector: Selector<ReduxState, Record<string, TEntity>>,
): SagaIterator<string | null> {
  if (R.isNil(sourceEntityId)) {
    return null;
  }

  const sourceRecordsById = yield select(sourceRecordsByIdSelector);
  return R.pathOr(null, [sourceEntityId, "linkedId"], sourceRecordsById);
}

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
  const validSourceRecords = sourceRecords as ValidEntity[];
  const apiDelay = apiDelayForTool(toolName);

  const [firstRecord] = validSourceRecords;
  const entityGroup = firstRecord.memberOf as EntityGroup;

  yield put(
    updateEntityGroupTransferCountTotal({
      entityGroup,
      countTotal: validSourceRecords.length,
    }),
  );

  for (const sourceRecord of validSourceRecords) {
    const workspaceIdToLinkedId = yield select(workspaceIdToLinkedIdSelector);
    const targetWorkspaceId = R.propOr<null, Record<string, string>, string>(
      null,
      sourceRecord.workspaceId,
      workspaceIdToLinkedId,
    );

    if (R.isNil(targetWorkspaceId)) {
      continue;
    }

    const targetRecord = yield call(
      apiCreateFunc,
      sourceRecord,
      targetWorkspaceId,
    );
    if (!R.isNil(targetRecord)) {
      targetRecords.push(targetRecord);
    }

    yield put(incrementEntityGroupTransferCountComplete(entityGroup));

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
    includedWorkspaceIdsByMappingSelector,
  );
  const mappingByToolName = yield select(mappingByToolNameSelector);
  const toolMapping = mappingByToolName[toolName];
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
    const recordsInWorkspace: TEntity[] = yield call(apiFetchFunc, workspaceId);
    allRecords.push(...recordsInWorkspace);

    yield delay(apiDelay);
  }

  return allRecords;
}

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

function apiDelayForTool(toolName: ToolName): number {
  return {
    [ToolName.Clockify]: CLOCKIFY_API_DELAY,
    [ToolName.Toggl]: TOGGL_API_DELAY,
  }[toolName];
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
