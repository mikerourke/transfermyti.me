import { get } from 'lodash';
import { EntityType } from '~/types/entityTypes';
import { EntityModel, ToolName } from '~/types/commonTypes';

export default function appendEntryCountToState<TState, TTimeEntryModel>(
  entityType: EntityType,
  toolName: ToolName,
  entityState: TState,
  timeEntries: TTimeEntryModel[],
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

  const updatedEntitiesById = Object.entries(entityState[toolName].byId).reduce(
    (acc, [entityId, entityRecord]) => {
      const { id, ...typedEntityRecord } = entityRecord as EntityModel;
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
