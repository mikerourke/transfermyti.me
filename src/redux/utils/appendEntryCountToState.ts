import { get } from 'lodash';
import { EntityType } from '~/types/entityTypes';
import { CompoundEntityModel, ToolName } from '~/types/commonTypes';

/**
 * Loops through the records in the specified entityState and returns state
 * with `entryCount` calculated for each record.
 */
export function appendEntryCountToState<TState, TTimeEntryModel>(
  entityType: EntityType,
  toolName: ToolName,
  entityState: TState,
  timeEntries: Array<TTimeEntryModel>,
): TState {
  const idField = entityType.concat('Id');

  const entryCountByEntityId = timeEntries.reduce((acc, timeEntry) => {
    const entityId = get(timeEntry, idField, null);
    if (!entityId) return acc;

    return {
      ...acc,
      [entityId]: get(acc, entityId, 0) + 1,
    };
  }, {});

  const updatedEntitiesById = Object.values(entityState[toolName].byId).reduce(
    (acc, entityRecord) => {
      const { id, ...typedEntityRecord } = entityRecord as CompoundEntityModel;
      const newTimeEntryCount = get(entryCountByEntityId, id, 0);

      return {
        ...acc,
        [id]: {
          id,
          ...typedEntityRecord,
          entryCount: typedEntityRecord.entryCount + newTimeEntryCount,
        },
      };
    },
    {},
  );

  return {
    ...entityState,
    [toolName]: {
      ...entityState[toolName],
      byId: updatedEntitiesById,
    },
  };
}
