import { isNil, pathOr, prop, propOr } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";

import {
  fetchObject,
  fetchPaginatedFromClockify,
} from "~/entityOperations/apiRequests";
import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { credentialsByToolNameSelector } from "~/modules/credentials/credentialsSelectors";
import { projectIdToLinkedIdSelector } from "~/modules/projects/projectsSelectors";
import type { ClockifyProjectResponse } from "~/modules/projects/sagas/clockifyProjectsSagas";
import type { ClockifyTagResponse } from "~/modules/tags/sagas/clockifyTagsSagas";
import { targetTagIdsSelectorFactory } from "~/modules/tags/tagsSelectors";
import type { ClockifyTaskResponse } from "~/modules/tasks/sagas/clockifyTasksSagas";
import { taskIdToLinkedIdSelector } from "~/modules/tasks/tasksSelectors";
import { EntityGroup, ToolName, type TimeEntry } from "~/typeDefs";

interface ClockifyTimeInterval {
  duration: string;
  end: string;
  start: string;
}

interface ClockifyTimeEntryResponse {
  billable: boolean;
  description: string;
  id: string;
  isLocked: boolean;
  project: ClockifyProjectResponse;
  tags: ClockifyTagResponse[];
  task: ClockifyTaskResponse | null;
  timeInterval: ClockifyTimeInterval;
  totalBillable: number | null;
  userId: string;
  workspaceId: string;
}

/**
 * Creates Clockify time entries in all workspaces and returns array of
 * transformed time entries.
 */
export function* createClockifyTimeEntriesSaga(
  sourceTimeEntries: TimeEntry[],
): SagaIterator<TimeEntry[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTimeEntries,
    apiCreateFunc: createClockifyTimeEntry,
  });
}

/**
 * Deletes all specified source time entries from Clockify.
 */
export function* deleteClockifyTimeEntriesSaga(
  sourceTimeEntries: TimeEntry[],
): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTimeEntries,
    apiDeleteFunc: deleteClockifyTimeEntry,
  });
}

/**
 * Fetches all time entries in Clockify workspaces and returns array of
 * transformed time entries.
 */
export function* fetchClockifyTimeEntriesSaga(): SagaIterator<TimeEntry[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyTimeEntriesInWorkspace,
  });
}

/**
 * Creates a new Clockify time entry.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--timeEntries-post
 */
function* createClockifyTimeEntry(
  sourceTimeEntry: TimeEntry,
  targetWorkspaceId: string,
): SagaIterator<TimeEntry> {
  const projectIdToLinkedId = yield select(projectIdToLinkedIdSelector);
  const taskIdToLinkedId = yield select(taskIdToLinkedIdSelector);

  let targetProjectId;
  let targetTagIds = [];
  let targetTaskId;

  try {
    if (sourceTimeEntry.projectId) {
      targetProjectId = prop(sourceTimeEntry.projectId, projectIdToLinkedId);
    }

    targetTagIds = yield select(
      targetTagIdsSelectorFactory(sourceTimeEntry.tagIds),
    );

    if (sourceTimeEntry.taskId) {
      targetTaskId = prop(sourceTimeEntry.taskId, taskIdToLinkedId);
    }
  } catch {
    // Ignore any errors here. We set default values for target properties,
    // so if any of them are null/empty, we just set them to undefined in the
    // payload.
  }

  const timeEntryRequest = {
    start: sourceTimeEntry.start,
    billable: sourceTimeEntry.isBillable,
    description: sourceTimeEntry.description,
    projectId: targetProjectId,
    taskId: targetTaskId,
    end: sourceTimeEntry.end,
    tagIds: targetTagIds.length !== 0 ? targetTagIds : undefined,
  };

  const targetTimeEntry = yield call(
    fetchObject,
    `/clockify/api/workspaces/${targetWorkspaceId}/time-entries`,
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
function* deleteClockifyTimeEntry(sourceTimeEntry: TimeEntry): SagaIterator {
  const { workspaceId, id } = sourceTimeEntry;
  yield call(
    fetchObject,
    `/clockify/api/workspaces/${workspaceId}/time-entries/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify time entries in specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--timeEntries-get
 */
function* fetchClockifyTimeEntriesInWorkspace(
  workspaceId: string,
): SagaIterator<TimeEntry[]> {
  const credentialsByToolName = yield select(credentialsByToolNameSelector);
  const clockifyUserId = credentialsByToolName?.clockify?.userId;
  if (!clockifyUserId) {
    throw new Error("Invalid or missing Clockify user ID");
  }

  const clockifyTimeEntries: ClockifyTimeEntryResponse[] = yield call(
    fetchPaginatedFromClockify,
    `/clockify/api/workspaces/${workspaceId}/user/${clockifyUserId}/time-entries`,
    { hydrated: true },
  );

  return clockifyTimeEntries.map(transformFromResponse);
}

function transformFromResponse(
  timeEntry: ClockifyTimeEntryResponse,
): TimeEntry {
  const startTime = getTime(timeEntry, "start");
  const clockifyTags = propOr<
    ClockifyTagResponse[],
    ClockifyTimeEntryResponse,
    ClockifyTagResponse[]
  >([], "tags", timeEntry);

  return {
    id: timeEntry.id,
    description: timeEntry.description,
    isBillable: timeEntry.billable,
    start: startTime,
    end: getTime(timeEntry, "end"),
    year: startTime.getFullYear(),
    isActive: false,
    clientId: timeEntry?.project?.clientId ?? null,
    projectId: timeEntry?.project?.id ?? null,
    tagIds: clockifyTags.map(({ id }) => id),
    tagNames: clockifyTags.map(({ name }) => name),
    taskId: timeEntry?.task?.id ?? null,
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
  timeEntry: ClockifyTimeEntryResponse,
  field: "start" | "end",
): Date {
  const value = pathOr(null, ["timeInterval", field], timeEntry);

  return isNil(value) ? new Date() : new Date(value);
}
