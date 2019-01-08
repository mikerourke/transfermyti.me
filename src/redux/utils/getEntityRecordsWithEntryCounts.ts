import get from 'lodash/get';
import { EntityType } from '../../types/commonTypes';
import { TimeEntryWithClientModel } from '../../types/timeEntriesTypes';

export default function getEntityRecordsWithEntryCounts<TModel>(
  entityType: EntityType,
  entityRecords: TModel[],
  timeEntriesById: Record<string, TimeEntryWithClientModel>,
): TModel[] {
  const idField = entityType.concat('Id');

  const entryCountByEntityId = Object.values(timeEntriesById).reduce(
    (acc, timeEntryRecord) => {
      const entityId = get(timeEntryRecord, idField, null);
      if (!entityId) return acc;

      return {
        ...acc,
        [entityId]: get(acc, entityId, 0) + 1,
      };
    },
    {},
  );

  return entityRecords.map((entityRecord: TModel & { id: string }) => ({
    ...entityRecord,
    entryCount: get(entryCountByEntityId, entityRecord.id, 0),
  }));
}
