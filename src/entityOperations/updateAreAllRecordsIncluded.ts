import * as R from "ramda";

import type { ValidEntity } from "~/typeDefs";

/**
 * Loops through the specified entity records and updates the `isIncluded`
 * field for each one to the value of the specified `areIncluded` arg.
 */
export function updateAreAllRecordsIncluded<TEntity>(
  entityRecordsById: Record<string, ValidEntity<TEntity>>,
  areIncluded: boolean,
): Record<string, TEntity> {
  const updatedRecordsById: Record<string, TEntity> = {};

  for (const [id, entityRecord] of Object.entries(entityRecordsById)) {
    let newIsIncluded = areIncluded;

    // We need to make sure we don't set records that have a matching record
    // on the target tool as included!
    if (newIsIncluded) {
      newIsIncluded = R.isNil(entityRecord.linkedId);
    }

    updatedRecordsById[id] = { ...entityRecord, isIncluded: newIsIncluded };
  }

  return updatedRecordsById;
}
