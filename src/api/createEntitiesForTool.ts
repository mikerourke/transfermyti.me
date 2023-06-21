import { isNil, propOr } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, delay, put, select } from "redux-saga/effects";

import { getApiDelayForTool } from "~/api/apiRequests";
import { entityGroupTransferCompletedCountIncremented } from "~/redux/allEntities/allEntities.actions";
import { workspaceIdToLinkedIdSelector } from "~/redux/workspaces/workspaces.selectors";
import type { EntityGroup, ToolName, ValidEntity } from "~/types";

/**
 * Loops through specified source records and calls the specified apiCreateFunc
 * on each record to create it on the target.
 */
export function* createEntitiesForTool<TEntity>({
  toolName,
  sourceRecords,
  apiCreateFunc,
}: {
  toolName: ToolName;
  sourceRecords: TEntity[];
  apiCreateFunc: (sourceRecord: AnyValid, workspaceId: string) => SagaIterator;
}): SagaIterator<TEntity[]> {
  const apiDelay = getApiDelayForTool(toolName);

  const validSourceRecords = sourceRecords as ValidEntity<TEntity>[];

  const targetRecords: TEntity[] = [];

  for (const sourceRecord of validSourceRecords) {
    // If the target workspace isn't in state, move to the next record. This
    // _shouldn't_ normally happen, but we're doing it here just to hedge
    // our bets:
    const targetWorkspaceId = yield call(
      findTargetWorkspaceId,
      sourceRecord.workspaceId,
    );

    if (isNil(targetWorkspaceId)) {
      continue;
    }

    const targetRecord = yield call(
      apiCreateFunc,
      sourceRecord,
      targetWorkspaceId,
    );

    if (!isNil(targetRecord)) {
      targetRecords.push(targetRecord);
    }

    const entityGroup = sourceRecord.memberOf as EntityGroup;
    yield put(entityGroupTransferCompletedCountIncremented(entityGroup));

    yield delay(apiDelay);
  }

  return targetRecords;
}

/**
 * Returns the target workspace ID associated with the specified source
 * workspace ID. If not found, return null.
 */
function* findTargetWorkspaceId(
  sourceWorkspaceId: string,
): SagaIterator<string | null> {
  const workspaceIdToLinkedId = yield select(workspaceIdToLinkedIdSelector);

  return propOr<null, Dictionary<string>, string>(
    null,
    sourceWorkspaceId,
    workspaceIdToLinkedId,
  );
}
