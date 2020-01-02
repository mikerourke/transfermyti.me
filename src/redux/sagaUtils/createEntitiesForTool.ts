/* eslint-disable @typescript-eslint/no-explicit-any */
import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { put, select, call, delay } from "redux-saga/effects";
import {
  incrementEntityGroupTransferCountComplete,
  updateEntityGroupTransferCountTotal,
} from "~/allEntities/allEntitiesActions";
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

  const entityGroup = yield call(
    updateTransferCountTotalForEntityGroup,
    validSourceRecords,
  );

  for (const sourceRecord of validSourceRecords) {
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

    yield put(incrementEntityGroupTransferCountComplete(entityGroup));

    yield delay(apiDelay);
  }

  return targetRecords;
}

function* updateTransferCountTotalForEntityGroup<TEntity>(
  sourceRecords: (TEntity & BaseEntityModel)[],
): SagaIterator<EntityGroup> {
  const [firstRecord] = sourceRecords;
  const entityGroup = firstRecord.memberOf as EntityGroup;

  yield put(
    updateEntityGroupTransferCountTotal({
      entityGroup,
      countTotal: sourceRecords.length,
    }),
  );

  return entityGroup;
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
