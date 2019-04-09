import { get, sortBy } from 'lodash';

/**
 * Sorts the specified entity records by name and groups them by their
 * corresponding workspaceId.
 */
export default function groupByWorkspace<TModel>(entityRecords: Array<TModel>) {
  const sortedEntityRecords = sortBy(entityRecords, record =>
    get(record, 'name', null),
  ) as Array<TModel>;

  return sortedEntityRecords.reduce((acc, entityRecord: TModel) => {
    const workspaceId = get(entityRecord, 'workspaceId', null);
    if (!workspaceId) return acc;

    return {
      ...acc,
      [workspaceId]: [
        ...get(acc, workspaceId, []),
        {
          workspaceId,
          ...entityRecord,
        },
      ],
    };
  }, {});
}
