import * as R from "ramda";
import { BaseEntityModel } from "~/allEntities/allEntitiesTypes";

export function updateIfAllIncluded<TEntity>(
  entityRecordsById: Record<string, TEntity & BaseEntityModel>,
  areAllIncluded: boolean,
): Record<string, TEntity> {
  const updatedRecordsById: Record<string, TEntity> = {};

  for (const [id, entityRecord] of Object.entries(entityRecordsById)) {
    let isIncluded = areAllIncluded;
    if (areAllIncluded) {
      isIncluded = R.isNil(entityRecord.linkedId);
    }

    updatedRecordsById[id] = { ...entityRecord, isIncluded };
  }

  return updatedRecordsById;
}
