import { get } from 'lodash';
import { EntityType } from '~/types/entityTypes';
import { TimeEntryWithClientModel } from '~/types/timeEntriesTypes';

export default function appendTimeEntryCount<TModel>(
  entityType: EntityType,
  entityRecords: TModel[],
  timeEntriesById: Record<string, TimeEntryWithClientModel>,
): TModel[] {
  const idField = entityType.concat('Id');

  const entryCountByEntityId = Object.values(timeEntriesById).reduce(
    (acc, timeEntry) => {
      const entityId = get(timeEntry, idField, null);
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
