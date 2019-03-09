import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import getEntityRecordsWithEntryCounts from './getEntityRecordsWithEntryCounts';
import getTogglInclusionRecords from './getTogglInclusionRecords';
import { EntityType } from '~/types/commonTypes';
import { TimeEntryWithClientModel } from '~/types/timeEntriesTypes';

export default function getEntityRecordsByWorkspaceId<TModel>(
  entityType: EntityType,
  entityRecords: TModel[],
  timeEntriesById: Record<string, TimeEntryWithClientModel>,
  inclusionsOnly: boolean,
) {
  const sortedEntityRecords = sortBy(entityRecords, record =>
    get(record, 'name', null),
  ) as TModel[];

  let recordsToGroup = getEntityRecordsWithEntryCounts(
    entityType,
    sortedEntityRecords,
    timeEntriesById,
  );

  if (inclusionsOnly) {
    recordsToGroup = getTogglInclusionRecords(recordsToGroup);
  }

  return recordsToGroup.reduce((acc, entityRecord: TModel) => {
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
