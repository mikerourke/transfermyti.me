import { SagaIterator } from "@redux-saga/types";
import differenceInMinutes from "date-fns/differenceInMinutes";
import * as R from "ramda";
import { call, select } from "redux-saga/effects";
import { sourceProjectsByIdSelector } from "~/projects/projectsSelectors";
import {
  BaseEntityModel,
  EntityGroup,
  Mapping,
  ProjectsByIdModel,
  TimeEntriesByIdModel,
  TimeEntryModel,
} from "~/typeDefs";

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
export function* linkEntitiesByIdByMapping<TEntity>(
  sourceRecords: TEntity[],
  targetRecords: TEntity[],
): SagaIterator<Record<Mapping, Record<string, TEntity>>> {
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
    return yield call(
      // @ts-ignore
      linkForMappingForTimeEntries,
      sourceRecords,
      targetRecords,
    );
  }

  // Users may have the same name, but they should never have the same email:
  const field = memberOf === EntityGroup.Users ? "email" : "name";

  return {
    source: linkForMappingByField(field, targetRecords, sourceRecords),
    target: linkForMappingByField(field, sourceRecords, targetRecords),
  };
}

/**
 * Links the corresponding records by the specified field property. If the field
 * for the source and target records match, set the `linkedId` for the source
 * to the target ID and vice versa. Also, if a match is found, set `isIncluded`
 * to `false` to prevent duplicate records/API errors.
 */
function linkForMappingByField<TEntity>(
  field: string,
  linkFromRecords: TEntity[],
  recordsToUpdate: TEntity[],
): Record<string, TEntity> {
  type LinkableRecord = TEntity & {
    id: string;
    memberOf: EntityGroup;
  };

  const linkFromEntitiesByField = R.indexBy<LinkableRecord>(
    R.prop(field),
    linkFromRecords as LinkableRecord[],
  );

  const linkedRecordsById = {};
  for (const recordToUpdate of recordsToUpdate as LinkableRecord[]) {
    const linkedId = R.pathOr(
      null,
      [recordToUpdate[field], "id"],
      linkFromEntitiesByField,
    );

    linkedRecordsById[recordToUpdate.id] = {
      ...recordToUpdate,
      linkedId,
      isIncluded: R.or(
        // By default, we want all the workspaces to be included (even if they
        // already exist on the target):
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
function* linkForMappingForTimeEntries(
  sourceTimeEntries: TimeEntryModel[],
  targetTimeEntries: TimeEntryModel[],
): SagaIterator<Record<Mapping, TimeEntriesByIdModel>> {
  const sourceProjectsById = yield select(sourceProjectsByIdSelector);

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

      // Even if the times are similar and the descriptions match, we still
      // want to make sure they're in the same project:
      const projectsMatch = doProjectsMatch(
        sourceProjectsById,
        sourceEntry,
        targetEntry,
      );
      const timeEntriesMatch = doTimeEntriesMatch(sourceEntry, targetEntry);

      if (projectsMatch && timeEntriesMatch) {
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
 * Compares the linked ID of the source entry's project to the target entry's
 * project ID. If they match, return true.
 */
function doProjectsMatch(
  sourceProjectsById: ProjectsByIdModel,
  sourceEntry: TimeEntryModel,
  targetEntry: TimeEntryModel,
): boolean {
  const sourceProject = sourceProjectsById[sourceEntry.projectId] ?? null;
  if (sourceProject === null) {
    return false;
  }

  if (targetEntry.projectId === null) {
    return false;
  }

  if (sourceProject.linkedId === null) {
    return false;
  }

  return sourceProject.linkedId === targetEntry.projectId;
}

/**
 * Compares the two time entries and returns true if they _appear_ to match
 * based on the date and description.
 */
function doTimeEntriesMatch(
  sourceEntry: TimeEntryModel,
  targetEntry: TimeEntryModel,
): boolean {
  return [
    sourceEntry.description === targetEntry.description,
    differenceInMinutes(sourceEntry.start, targetEntry.start) <= 1,
    differenceInMinutes(sourceEntry.end, targetEntry.end) <= 1,
  ].every(Boolean);
}
