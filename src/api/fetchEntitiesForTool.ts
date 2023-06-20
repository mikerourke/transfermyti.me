import { propOr } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, delay, select } from "redux-saga/effects";

import { getApiDelayForTool } from "~/api/apiRequests";
import { mappingByToolNameSelector } from "~/redux/allEntities/allEntitiesSelectors";
import { includedWorkspaceIdsByMappingSelector } from "~/redux/workspaces/workspacesSelectors";
import type { ToolName } from "~/types";

/**
 * Fetches all the of the entity records in all workspaces associated with the
 * specified tool name by calling the specified fetch function for each
 * workspace.
 */
export function* fetchEntitiesForTool<TEntity>({
  toolName,
  apiFetchFunc,
}: {
  toolName: ToolName;
  apiFetchFunc: (workspaceId: string) => SagaIterator<TEntity[]>;
}): SagaIterator<TEntity[]> {
  const workspaceIds = yield call(findWorkspaceIdsForTool, toolName);

  if (workspaceIds.length === 0) {
    return [];
  }

  const apiDelay = getApiDelayForTool(toolName);

  const allRecords: TEntity[] = [];

  for (const workspaceId of workspaceIds) {
    const recordsInWorkspace: TEntity[] = yield call(apiFetchFunc, workspaceId);

    allRecords.push(...recordsInWorkspace);

    yield delay(apiDelay);
  }

  return allRecords;
}

/**
 * Returns the workspace IDs associated with the specified tool name based on
 * the mapping in state.
 */
function* findWorkspaceIdsForTool(toolName: ToolName): SagaIterator<string[]> {
  const workspaceIdsByMapping = yield select(
    includedWorkspaceIdsByMappingSelector,
  );

  const mappingByToolName = yield select(mappingByToolNameSelector);

  const toolMapping = mappingByToolName[toolName];

  return propOr<string[], Dictionary<string>, string[]>(
    [],
    toolMapping,
    workspaceIdsByMapping,
  );
}
