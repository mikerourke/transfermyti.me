import { isNil } from "lodash";

/**
 * Given the specified records (or possibly null), only return if its a valid
 * array with a length greater than 0.
 */
export function getValidEntities<TEntity>(
  entityRecords?: TEntity[] | null,
): TEntity[] {
  if (isNil(entityRecords)) {
    return [];
  }

  if (Array.isArray(entityRecords) && entityRecords.length !== 0) {
    return entityRecords;
  }

  return [];
}
