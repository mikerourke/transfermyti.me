import { get, isNil } from "lodash";
import {
  CompoundEntityModel,
  EntityType,
  ToolName,
} from "~/common/commonTypes";

interface Params<TEntityState, TTimeEntry> {
  entityType: EntityType;
  toolName: ToolName;
  entityState: TEntityState;
  timeEntries: TTimeEntry[];
}

/**
 * Loops through the records in the specified entityState and returns state
 * with `entryCount` calculated for each record.
 */
export function appendEntryCountToState<TEntityState, TTimeEntry>({
  entityType,
  toolName,
  entityState,
  timeEntries,
}: Params<TEntityState, TTimeEntry>): TEntityState {
  const byIdForTool = get(entityState, [toolName, "byId"], {});
  const entityRecords: CompoundEntityModel[] = Object.values(byIdForTool);

  if (entityRecords.length === 0) {
    return entityState;
  }

  const idField = entityType.concat("Id");
  const entryCountsByEntityId = calculateEntryCountByEntityId(
    idField,
    timeEntries,
  );

  const updatedEntitiesById = entityRecords.reduce((acc, entityRecord) => {
    const { id, entryCount: currentEntryCount, ...restRecord } = entityRecord;

    // Add the existing entry count of the entity record to the calculated
    // entry count from the calculateEntryCountByEntityId method:
    const calculatedEntryCount = get(entryCountsByEntityId, id, 0);

    return {
      ...acc,
      [id]: {
        id,
        ...restRecord,
        entryCount: currentEntryCount + calculatedEntryCount,
      },
    };
  }, {});

  return {
    ...entityState,
    [toolName]: {
      ...entityState[toolName],
      byId: updatedEntitiesById,
    },
  };
}

/**
 * Returns the sum of time entry counts by entity ID based on the specified
 * idField of the entity.
 * @example
 *   const timeEntries = [
 *     { id: 1, projectId: 100, ... },
 *     { id: 2, projectId: 101, ... },
 *     { id: 3, projectId: 101, ... },
 *     { id: 4, projectId: 101, ... },
 *     { id: 5, projectId: 102, ... },
 *   ];
 *   calculateEntryCountByEntityId("projectId", timeEntries);
 *   >> { 100: 1, 101: 3, 102: 1 }
 */
function calculateEntryCountByEntityId<TTimeEntry>(
  idField: string,
  timeEntries: TTimeEntry[],
): Record<string, number> {
  return timeEntries.reduce((acc, timeEntry) => {
    // If the timeEntry record has the specified idField (e.g. projectId),
    // increment the value associated with that ID value by 1:
    const entityId = get(timeEntry, idField, null);
    if (isNil(entityId)) {
      return acc;
    }

    // If the accumulator object doesn't already have a key for the
    // entityId, add it to the object with a value of 1:
    const currentCountForEntityId = get(acc, entityId, 0);
    return {
      ...acc,
      [entityId]: currentCountForEntityId + 1,
    };
  }, {});
}
