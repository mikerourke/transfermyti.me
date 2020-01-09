/* eslint-disable @typescript-eslint/no-explicit-any */
import { SagaIterator } from "@redux-saga/types";
import { call, delay, put } from "redux-saga/effects";
import { incrementEntityGroupTransferCompletedCount } from "~/allEntities/allEntitiesActions";
import { getApiDelayForTool } from "./fetchActions";
import { BaseEntityModel, EntityGroup, ToolName } from "~/typeDefs";

export function* deleteEntitiesForTool<TEntity>({
  toolName,
  sourceRecords,
  apiDeleteFunc,
}: {
  toolName: ToolName;
  sourceRecords: TEntity[];
  // FIXME: I'm using `any` here because it's throwing a TS error that I'm not sure how to fix.
  apiDeleteFunc: (sourceRecord: TEntity | any) => SagaIterator;
}): SagaIterator {
  type ValidEntity = TEntity & BaseEntityModel;
  const validSourceRecords = sourceRecords as ValidEntity[];
  const apiDelay = getApiDelayForTool(toolName);

  for (const sourceRecord of validSourceRecords) {
    const entityGroup = sourceRecord.memberOf as EntityGroup;
    yield call(apiDeleteFunc, sourceRecord);

    yield put(incrementEntityGroupTransferCompletedCount(entityGroup));

    yield delay(apiDelay);
  }
}
