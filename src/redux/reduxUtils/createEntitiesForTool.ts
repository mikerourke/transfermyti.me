/* eslint-disable @typescript-eslint/no-explicit-any */
import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, delay, put, select } from "redux-saga/effects";
import { incrementEntityGroupTransferCompletedCount } from "~/allEntities/allEntitiesActions";
import { workspaceIdToLinkedIdSelector } from "~/workspaces/workspacesSelectors";
import { getApiDelayForTool } from "./fetchActions";
import {
  BaseEntityModel,
  EntityGroup,
  ToolName,
} from "~/allEntities/allEntitiesTypes";

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
  const apiDelay = getApiDelayForTool(toolName);

  for (const sourceRecord of validSourceRecords) {
    const entityGroup = sourceRecord.memberOf as EntityGroup;
    const targetWorkspaceId = yield call(
      findTargetWorkspaceId,
      sourceRecord.workspaceId,
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

    yield put(incrementEntityGroupTransferCompletedCount(entityGroup));

    yield delay(apiDelay);
  }

  return targetRecords;
}

function* findTargetWorkspaceId(
  sourceWorkspaceId: string,
): SagaIterator<string | null> {
  const workspaceIdToLinkedId = yield select(workspaceIdToLinkedIdSelector);

  return R.propOr<null, Record<string, string>, string>(
    null,
    sourceWorkspaceId,
    workspaceIdToLinkedId,
  );
}
