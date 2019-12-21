import { compact, get, isNil, sortBy } from "lodash";
import { EntityGroupsByKey } from "~/common/commonTypes";

/**
 * Sorts the specified entity records by name and groups them by their
 * corresponding workspaceId.
 */
export function groupByWorkspace<TEntity>(
  entityRecords: Array<TEntity>,
): EntityGroupsByKey<TEntity> {
  const sortedEntityRecords = sortBy(entityRecords, record =>
    get(record, "name", null),
  ) as Array<TEntity>;
  const validEntityRecords = compact(sortedEntityRecords);

  const entitiesByWorkspace: Record<string, Array<TEntity>> = {};

  validEntityRecords.forEach(entityRecord => {
    const workspaceId = get(entityRecord, "workspaceId", null);
    if (isNil(workspaceId)) {
      return;
    }

    entitiesByWorkspace[workspaceId] = [
      ...get(entitiesByWorkspace, workspaceId, []),
      {
        workspaceId,
        ...entityRecord,
      },
    ];
  });

  return entitiesByWorkspace;
}
