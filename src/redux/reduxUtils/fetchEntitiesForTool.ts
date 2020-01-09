import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, delay, select } from "redux-saga/effects";
import { mappingByToolNameSelector } from "~/app/appSelectors";
import { includedWorkspaceIdsByMappingSelector } from "~/workspaces/workspacesSelectors";
import { getApiDelayForTool } from "./fetchActions";
import { ToolName } from "~/typeDefs";

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

  const allRecords: TEntity[] = [];
  const apiDelay = getApiDelayForTool(toolName);

  for (const workspaceId of workspaceIds) {
    const recordsInWorkspace: TEntity[] = yield call(apiFetchFunc, workspaceId);
    allRecords.push(...recordsInWorkspace);

    yield delay(apiDelay);
  }

  return allRecords;
}

function* findWorkspaceIdsForTool(toolName: ToolName): SagaIterator<string[]> {
  const workspaceIdsByMapping = yield select(
    includedWorkspaceIdsByMappingSelector,
  );
  const mappingByToolName = yield select(mappingByToolNameSelector);
  const toolMapping = mappingByToolName[toolName];

  return R.propOr<string[], Record<string, string>, string[]>(
    [],
    toolMapping,
    workspaceIdsByMapping,
  );
}
