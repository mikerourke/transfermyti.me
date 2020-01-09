import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, select } from "redux-saga/effects";
import * as reduxUtils from "~/redux/reduxUtils";
import { credentialsByToolNameSelector } from "~/credentials/credentialsSelectors";
import { sourceProjectsByIdSelector } from "~/projects/projectsSelectors";
import { targetTagIdsSelectorFactory } from "~/tags/tagsSelectors";
import { sourceTasksByIdSelector } from "~/tasks/tasksSelectors";
import { ClockifyProjectResponseModel } from "~/projects/sagas/clockifyProjectsSagas";
import { ClockifyTagResponseModel } from "~/tags/sagas/clockifyTagsSagas";
import { ClockifyTaskResponseModel } from "~/tasks/sagas/clockifyTasksSagas";
import { EntityGroup, TimeEntryModel, ToolName } from "~/typeDefs";

interface ClockifyTimeIntervalModel {
  duration: string;
  end: string;
  start: string;
}

interface ClockifyTimeEntryResponseModel {
  billable: boolean;
  description: string;
  id: string;
  isLocked: boolean;
  project: ClockifyProjectResponseModel;
  tags: ClockifyTagResponseModel[];
  task: ClockifyTaskResponseModel | null;
  timeInterval: ClockifyTimeIntervalModel;
  totalBillable: number | null;
  userId: string;
  workspaceId: string;
}

/**
 * Creates Clockify time entries in all workspaces and returns array of
 * transformed time entries.
 */
export function* createClockifyTimeEntriesSaga(
  sourceTimeEntries: TimeEntryModel[],
): SagaIterator<TimeEntryModel[]> {
  return yield call(reduxUtils.createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTimeEntries,
    apiCreateFunc: createClockifyTimeEntry,
  });
}

/**
 * Deletes all specified source time entries from Clockify.
 */
export function* deleteClockifyTimeEntriesSaga(
  sourceTimeEntries: TimeEntryModel[],
): SagaIterator {
  yield call(reduxUtils.deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTimeEntries,
    apiDeleteFunc: deleteClockifyTimeEntry,
  });
}

/**
 * Fetches all time entries in Clockify workspaces and returns array of
 * transformed time entries.
 */
export function* fetchClockifyTimeEntriesSaga(): SagaIterator<
  TimeEntryModel[]
> {
  return yield call(reduxUtils.fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyTimeEntriesInWorkspace,
  });
}

/**
 * Creates a new Clockify time entry.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--timeEntries-post
 */
function* createClockifyTimeEntry(
  sourceTimeEntry: TimeEntryModel,
  targetWorkspaceId: string,
): SagaIterator<TimeEntryModel> {
  const targetProjectId = yield call(
    reduxUtils.findTargetEntityId,
    sourceTimeEntry.projectId,
    sourceProjectsByIdSelector,
  );

  const targetTagIds = yield select(
    targetTagIdsSelectorFactory(sourceTimeEntry.tagIds),
  );

  const targetTaskId = yield call(
    reduxUtils.findTargetEntityId,
    sourceTimeEntry.taskId,
    sourceTasksByIdSelector,
  );

  const timeEntryRequest = {
    start: sourceTimeEntry.start,
    billable: sourceTimeEntry.isBillable,
    description: sourceTimeEntry.description,
    projectId: targetProjectId ?? undefined,
    taskId: targetTaskId ?? undefined,
    end: sourceTimeEntry.end,
    tagIds: targetTagIds.length !== 0 ? targetTagIds : undefined,
  };

  const targetTimeEntry = yield call(
    reduxUtils.fetchObject,
    `/clockify/api/v1/workspaces/${targetWorkspaceId}/time-entries`,
    {
      method: "POST",
      body: timeEntryRequest,
    },
  );

  return transformFromResponse(targetTimeEntry);
}

/**
 * Deletes the specified Clockify time entry.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--time-entries--id--delete
 */
function* deleteClockifyTimeEntry(
  sourceTimeEntry: TimeEntryModel,
): SagaIterator {
  const { workspaceId, id } = sourceTimeEntry;
  yield call(
    reduxUtils.fetchObject,
    `/clockify/api/v1/workspaces/${workspaceId}/time-entries/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify time entries in specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--timeEntries-get
 */
function* fetchClockifyTimeEntriesInWorkspace(
  workspaceId: string,
): SagaIterator<TimeEntryModel[]> {
  const credentialsByToolName = yield select(credentialsByToolNameSelector);
  const clockifyUserId = credentialsByToolName?.clockify?.userId;
  if (!clockifyUserId) {
    throw new Error("Invalid or missing Clockify user ID");
  }

  const clockifyTimeEntries: ClockifyTimeEntryResponseModel[] = yield call(
    reduxUtils.fetchPaginatedFromClockify,
    `/clockify/api/v1/workspaces/${workspaceId}/user/${clockifyUserId}/time-entries`,
    { hydrated: true },
  );

  return clockifyTimeEntries.map(transformFromResponse);
}

function transformFromResponse(
  timeEntry: ClockifyTimeEntryResponseModel,
): TimeEntryModel {
  const startTime = getTime(timeEntry, "start");
  const clockifyTags = R.propOr<
    ClockifyTagResponseModel[],
    ClockifyTimeEntryResponseModel,
    ClockifyTagResponseModel[]
  >([], "tags", timeEntry);

  return {
    id: timeEntry.id,
    description: timeEntry.description,
    isBillable: timeEntry.billable,
    start: startTime,
    end: getTime(timeEntry, "end"),
    year: startTime.getFullYear(),
    isActive: false,
    clientId: timeEntry.project?.clientId ?? null,
    projectId: timeEntry.project?.id ?? null,
    tagIds: clockifyTags.map(({ id }) => id),
    tagNames: clockifyTags.map(({ name }) => name),
    taskId: timeEntry.task?.id ?? null,
    userId: timeEntry.userId ?? null,
    userGroupIds: [],
    workspaceId: timeEntry.workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.TimeEntries,
  };
}

function getTime(
  timeEntry: ClockifyTimeEntryResponseModel,
  field: "start" | "end",
): Date {
  const value = R.pathOr(null, ["timeInterval", field], timeEntry);
  return R.isNil(value) ? new Date() : new Date(value);
}
