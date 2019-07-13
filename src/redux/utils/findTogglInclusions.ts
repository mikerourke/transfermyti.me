import { get, isNil } from "lodash";

/**
 * Returns the entities that should be included in the transfer. Only records
 * without a `linkedId` that have the `isIncluded` flag set to `true` should
 * be included in the transfer to Clockify.
 */
export function findTogglInclusions<TEntity>(
  entityRecords: Array<TEntity>,
): Array<TEntity> {
  return entityRecords.reduce(
    (acc, entityRecord: TEntity & { isIncluded: boolean }) => {
      // If there is no corresponding entity with the same name on Clockify
      // and the user marked it as included, we're good to go!
      const linkedId = get(entityRecord, "linkedId", null);
      if (!isNil(linkedId) || !entityRecord.isIncluded) return acc;

      return [...acc, entityRecord];
    },
    [],
  );
}
