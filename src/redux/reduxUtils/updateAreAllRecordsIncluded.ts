import * as R from "ramda";
import { BaseEntityModel } from "~/typeDefs";

export function updateAreAllRecordsIncluded<TEntity>(
  entityRecordsById: Record<string, TEntity & BaseEntityModel>,
  areIncluded: boolean,
): Record<string, TEntity> {
  const updatedRecordsById: Record<string, TEntity> = {};

  for (const [id, entityRecord] of Object.entries(entityRecordsById)) {
    let newIsIncluded = areIncluded;
    if (newIsIncluded) {
      newIsIncluded = R.isNil(entityRecord.linkedId);
    }

    updatedRecordsById[id] = { ...entityRecord, isIncluded: newIsIncluded };
  }

  return updatedRecordsById;
}
