import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { EntityModel, EntityType } from '../../types/commonTypes';
import { TimeEntryModel } from '../../types/timeEntriesTypes';

export default function getEntityRecordsByWorkspaceId(
  entityType: EntityType,
  entityRecords: EntityModel[],
  timeEntriesById: Record<string, TimeEntryModel & { clientId?: string }>,
) {
  const sortedEntityRecords = sortBy(entityRecords, record =>
    get(record, 'name', null),
  );

  const entryCountByEntityId = Object.values(timeEntriesById).reduce(
    (acc, timeEntryRecord) => {
      const idField = entityType.concat('Id');
      const entityId = get(timeEntryRecord, idField, null);
      if (!entityId) return acc;
      return {
        ...acc,
        [entityId]: get(acc, entityId, 0) + 1,
      };
    },
    {},
  );

  return sortedEntityRecords.reduce((acc, entityRecord: EntityModel) => {
    const workspaceId = get(entityRecord, 'workspaceId', null);
    if (!workspaceId) return acc;

    return {
      ...acc,
      [workspaceId]: [
        ...get(acc, workspaceId, []),
        {
          workspaceId,
          ...entityRecord,
          entryCount: get(entryCountByEntityId, entityRecord.id, 0),
        },
      ],
    };
  }, {});
}
