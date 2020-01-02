import { SagaIterator } from "@redux-saga/types";
import { Selector } from "reselect";
import * as R from "ramda";
import { select } from "redux-saga/effects";
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
