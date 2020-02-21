import { SagaIterator } from "@redux-saga/types";
import differenceInMinutes from "date-fns/differenceInMinutes";
import * as R from "ramda";
import { call, select } from "redux-saga/effects";
import { workspaceIdToLinkedIdSelector } from "~/workspaces/workspacesSelectors";
import {
  BaseEntityModel,
  EntityGroup,
  Mapping,
  ProjectsByIdModel,
  ReduxState,
  TimeEntriesByIdModel,
  TimeEntryModel,
} from "~/typeDefs";

enum LinkFromType {
  Source,
  Target,
}

/**
 * Sets the `linkedId` and `isIncluded` field of the source and target records
 * and returns an object with a `source` and `target` property containing the
 * corresponding records by their `id` field.
 * @example
 *  const sourceRecords = [{ id: "S1", name: "Foo" }, { id: "S2", name: "Bar" }];
 *  const targetRecords = [{ id: "T1", name: "Foo" }, { id: "T2", name: "Baz" }];
 *
 *  const result = linkEntitiesByIdByMapping(sourceRecords, targetRecords);
 *  console.log(result);
 *  // Logs out:
 *  {
 *    source: {
 *      S1: { id: "S1", name: "Foo", linkedId: "T1", isIncluded: false },
 *      S2: { id: "S2", name: "Bar", linkedId: null, isIncluded: true },
 *    },
 *    target: {
 *      T1: { id: "T1", name: "Foo", linkedId: "S1", isIncluded: false },
 *      T2: { id: "T2", name: "Bar", linkedId: null, isIncluded: true },
 *    },
 *  }
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
  const workspaceIdToLinkedId = yield select(workspaceIdToLinkedIdSelector);

  const source = linkForMappingByField(
    field,
    workspaceIdToLinkedId,
    LinkFromType.Target,
    targetRecords,
    sourceRecords,
  );
  const target = linkForMappingByField(
    field,
    workspaceIdToLinkedId,
    LinkFromType.Source,
    sourceRecords,
    targetRecords,
  );

  return { source, target };
}

/**
 * Links the corresponding records by the specified field property. If the field
 * for the source and target records match, set the `linkedId` for the source
 * to the target ID and vice versa. Also, if a match is found, set `isIncluded`
 * to `false` to prevent duplicate records/API errors.
 */
function linkForMappingByField<TEntity>(
  field: string,
  workspaceIdToLinkedId: Record<string, string>,
  linkFromType: LinkFromType,
  linkFromRecords: TEntity[],
  recordsToUpdate: TEntity[],
): Record<string, TEntity> {
  type LinkableRecord = TEntity & {
    id: string;
    workspaceId: string;
    memberOf: EntityGroup;
  };

  const linkedRecordsById = {};

  for (const recordToUpdate of recordsToUpdate as LinkableRecord[]) {
    const matchingLinkedRecord = (linkFromRecords as LinkableRecord[]).find(
      linkFromRecord => {
        // For workspaces, we only want to check if the names match (since
        // workspaces are the top-level entity and it's impossible to have 2
        // workspaces with the same name):
        const fieldsMatch = recordToUpdate[field] === linkFromRecord[field];
        if (recordToUpdate.memberOf === EntityGroup.Workspaces) {
          return fieldsMatch;
        }

        // For all other entities, we need to ensure the fields match _and_
        // the workspaces are linked. If we don't perform this check, the
        // transfer process will fail if the user has multiple workspaces
        // that have the same named entity in each one. For example, if a user
        // has Workspace A and Workspace B, and both of them have a client
        // named "Client", the client ID of Workspace A may be associated
        // with a project in Workspace B and the API will return a 400.
        // See this issue: https://github.com/mikerourke/transfermyti.me/issues/32
        const linkedWorkspaceId =
          workspaceIdToLinkedId[linkFromRecord.workspaceId];
        return fieldsMatch && recordToUpdate.workspaceId === linkedWorkspaceId;
      },
    );

    const linkedId = R.isNil(matchingLinkedRecord)
      ? null
      : matchingLinkedRecord.id;
    const isIncluded = R.isNil(linkedId)
      ? recordToUpdate.memberOf !== EntityGroup.Workspaces
      : false;

    linkedRecordsById[recordToUpdate.id] = {
      ...recordToUpdate,
      linkedId,
      isIncluded,
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
  // I can't use the `sourceProjectsById` selector here because I get a reselect
  // error. Since the linking process only happens when the time entries are
  // initially fetched/created, it shouldn't cause a performance hit due to
  // lack of memoization:
  const sourceProjectsById = yield select(
    (state: ReduxState) => state.projects.source,
  );

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
  if (sourceEntry.projectId === null && targetEntry.projectId === null) {
    return true;
  }

  if (sourceEntry.projectId !== null && targetEntry.projectId === null) {
    return false;
  }

  if (sourceEntry.projectId === null && targetEntry.projectId !== null) {
    return false;
  }

  const validProjectId = sourceEntry.projectId ?? "";
  const sourceProject = sourceProjectsById[validProjectId] ?? null;
  if (sourceProject === null) {
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
