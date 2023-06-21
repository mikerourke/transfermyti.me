import { isNil } from "ramda";

import type { ValidEntity } from "~/types";

/**
 * Loops through the specified entity records and updates the `isIncluded`
 * field for each one to the value of the specified `areIncluded` arg.
 */
export function updateAreAllRecordsIncluded<TEntity>(
  entityRecordsById: Dictionary<ValidEntity<TEntity>>,
  areIncluded: boolean,
): Dictionary<TEntity> {
  const updatedRecordsById: Dictionary<TEntity> = {};

  for (const [id, entityRecord] of Object.entries(entityRecordsById)) {
    let isIncluded = areIncluded;

    // We need to make sure we don't set records that have a matching record
    // on the target tool as included!
    if (isIncluded) {
      isIncluded = isNil(entityRecord.linkedId);
    }

    updatedRecordsById[id] = { ...entityRecord, isIncluded };
  }

  return updatedRecordsById;
}
