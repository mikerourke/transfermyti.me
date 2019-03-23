import { get, sortBy } from 'lodash';

export default function groupByWorkspace<TModel>(entityRecords: TModel[]) {
  const sortedEntityRecords = sortBy(entityRecords, record =>
    get(record, 'name', null),
  ) as TModel[];

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
