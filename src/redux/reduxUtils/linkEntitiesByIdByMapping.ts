import differenceInMinutes from "date-fns/differenceInMinutes";
import * as R from "ramda";
import {
  BaseEntityModel,
  EntityGroup,
  Mapping,
} from "~/allEntities/allEntitiesTypes";
import {
  TimeEntryModel,
  TimeEntriesByIdModel,
} from "~/timeEntries/timeEntriesTypes";

/**
 * Sets the `linkedId` and `isIncluded` field of the source and target records
 * and returns an object with a `source` and `target` property containing the
 * corresponding records by their `id` field.
 * @example
 *   const sourceRecords = [{ id: "S1", name: "Foo" }, { id: "S2", name: "Bar" }];
 *   const targetRecords = [{ id: "T1", name: "Foo" }, { id: "T2", name: "Baz" }];
 *
 *   const result = linkEntitiesByIdByMapping(sourceRecords, targetRecords);
 *   console.log(result);
 *   {
 *     source: {
 *       S1: { id: "S1", name: "Foo", linkedId: "T1", isIncluded: false },
 *       S2: { id: "S2", name: "Bar", linkedId: null, isIncluded: true },
 *     },
 *     target: {
 *       T1: { id: "T1", name: "Foo", linkedId: "S1", isIncluded: false },
 *       T2: { id: "T2", name: "Bar", linkedId: null, isIncluded: true },
 *     },
 *   }
 */
export function linkEntitiesByIdByMapping<TEntity>(
  sourceRecords: TEntity[],
  targetRecords: TEntity[],
): Record<Mapping, Record<string, TEntity>> {
  if (sourceRecords.length === 0) {
    return {
      source: {},
      target: {},
    };
  }

  const [{ memberOf }] = (sourceRecords as unknown) as BaseEntityModel[];
  if (memberOf === EntityGroup.TimeEntries) {
    // TypeScript freaks out on this one, but I don't want to add 400 type
    // assertions. I know they're time entries and I know the function is going
    // to return the correct values!
    // @ts-ignore
    return linkForMappingForTimeEntries(sourceRecords, targetRecords);
  }

  return {
    source: linkForMappingByName(targetRecords, sourceRecords),
    target: linkForMappingByName(sourceRecords, targetRecords),
  };
}

/**
 * Links the corresponding records by their `name` property. If the `name`
 * for the source and target records match, set the `linkedId` for the source
 * to the target ID and vice versa. Also, if a match is found, set `isIncluded`
 * to `false` to prevent duplicate records/API errors.
 */
function linkForMappingByName<TEntity>(
  linkFromRecords: TEntity[],
  recordsToUpdate: TEntity[],
): Record<string, TEntity> {
  type LinkableRecord = TEntity & {
    name: string;
    id: string;
    memberOf: EntityGroup;
  };

  const linkFromEntitiesByName = R.indexBy<LinkableRecord>(
    R.prop("name"),
    linkFromRecords as LinkableRecord[],
  );

  // for (const linkFromRecord of linkFromRecords as LinkableRecord[]) {
  //   linkFromEntitiesByName[linkFromRecord.name] = linkFromRecord;
  // }

  const linkedRecordsById = {};
  for (const recordToUpdate of recordsToUpdate as LinkableRecord[]) {
    const linkedId = R.pathOr(
      null,
      [recordToUpdate.name, "id"],
      linkFromEntitiesByName,
    );

    linkedRecordsById[recordToUpdate.id] = {
      ...recordToUpdate,
      linkedId,
      isIncluded: R.or(
        recordToUpdate.memberOf === EntityGroup.Workspaces,
        R.isNil(linkedId),
      ),
    };
  }

  return linkedRecordsById;
}

/**
 * Compares the source and target time entries and sets the `linkedId` for
 * matching entries. If an entries' match is found, set the `isIncluded`
 * property to false. The criteria for what represents a "matching" entry is
 * in the `doTimeEntriesMatch()` function below.
 */
function linkForMappingForTimeEntries(
  sourceTimeEntries: TimeEntryModel[],
  targetTimeEntries: TimeEntryModel[],
): Record<Mapping, TimeEntriesByIdModel> {
  // Expedite the matching process by sorting by start date (since the start
  // and end date/time are compared against each other):
  const sortByDate = R.sortBy(R.prop("start"));
  const sortedSourceEntries = sortByDate(sourceTimeEntries);
  const sortedTargetEntries = sortByDate(targetTimeEntries);

  const sourceById: Record<string, TimeEntryModel> = {};
  const targetById: Record<string, TimeEntryModel> = {};

  for (const sourceEntry of sortedSourceEntries) {
    sourceById[sourceEntry.id] = sourceEntry;

    for (const targetEntry of sortedTargetEntries) {
      targetById[targetEntry.id] = targetEntry;

      if (doTimeEntriesMatch(sourceEntry, targetEntry)) {
        sourceById[sourceEntry.id].linkedId = targetEntry.id;
        targetById[targetEntry.id].linkedId = sourceEntry.id;
      }
    }

    sourceById[sourceEntry.id].isIncluded = R.isNil(
      sourceById[sourceEntry.id].linkedId,
    );
  }

  return {
    source: sourceById,
    target: targetById,
  };
}

/**
 * Compares the two time entries and returns true if they _appear_ to match
 * based on the date, description, flags, etc.
 */
function doTimeEntriesMatch(
  sourceEntry: TimeEntryModel,
  targetEntry: TimeEntryModel,
): boolean {
  return [
    sourceEntry.description === targetEntry.description,
    sourceEntry.isActive === targetEntry.isActive,
    sourceEntry.isBillable === targetEntry.isBillable,
    differenceInMinutes(sourceEntry.start, targetEntry.start) <= 1,
    differenceInMinutes(sourceEntry.end, targetEntry.end) <= 1,
  ].every(Boolean);
}
