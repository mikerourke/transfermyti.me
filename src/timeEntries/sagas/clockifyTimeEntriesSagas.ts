import * as R from "ramda";
import { call, select } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import {
  createEntitiesForTool,
  fetchEntitiesForTool,
  fetchObject,
  paginatedClockifyFetch,
} from "~/redux/sagaUtils";
import { selectTargetProjectId } from "~/projects/projectsSelectors";
import { selectTargetTagIds } from "~/tags/tagsSelectors";
import { selectTargetTaskId } from "~/tasks/tasksSelectors";
import { ClockifyProjectResponseModel } from "~/projects/sagas/clockifyProjectsSagas";
import { ClockifyTagResponseModel } from "~/tags/sagas/clockifyTagsSagas";
import { ClockifyTaskResponseModel } from "~/tasks/sagas/clockifyTasksSagas";
import { ClockifyUserResponseModel } from "~/users/sagas/clockifyUsersSagas";
import { EntityGroup, ToolName } from "~/entities/entitiesTypes";
import { TimeEntryModel } from "~/timeEntries/timeEntriesTypes";

interface ClockifyTimeIntervalModel {
  duration: string;
  end: string;
  start: string;
}

interface ClockifyTimeEntryResponseModel {
  billable: boolean;
  description: string;
  hourlyRate: { amount: number; currency: string };
  id: string;
  isLocked: boolean;
  project: ClockifyProjectResponseModel;
  projectId: string;
  tags: ClockifyTagResponseModel[];
  task: ClockifyTaskResponseModel;
  timeInterval: ClockifyTimeIntervalModel;
  totalBillable: number | null;
  user: ClockifyUserResponseModel;
  workspaceId: string;
}

/**
 * Creates Clockify time entries in all workspaces and returns array of
 * transformed time entries.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--timeEntries-post
 */
export function* createClockifyTimeEntriesSaga(
  sourceTimeEntries: TimeEntryModel[],
): SagaIterator<TimeEntryModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTimeEntries,
    apiCreateFunc: createClockifyTimeEntry,
  });
}

/**
 * Fetches all time entries in Clockify workspaces and returns array of
 * transformed time entries.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--timeEntries-get
 */
export function* fetchClockifyTimeEntriesSaga(): SagaIterator<
  TimeEntryModel[]
> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyTimeEntriesInWorkspace,
  });
}

function* createClockifyTimeEntry(
  sourceTimeEntry: TimeEntryModel,
  targetWorkspaceId: string,
): SagaIterator<TimeEntryModel> {
  const targetProjectId = yield select(
    selectTargetProjectId,
    sourceTimeEntry.projectId,
  );
  const targetTaskId = yield select(selectTargetTaskId, sourceTimeEntry.taskId);
  const targetTagIds = yield select(selectTargetTagIds, sourceTimeEntry.tagIds);
  const timeEntryRequest = {
    start: sourceTimeEntry.start,
    billable: sourceTimeEntry.isBillable,
    description: sourceTimeEntry.description,
    projectId: R.isNil(targetProjectId) ? undefined : targetProjectId,
    taskId: R.isNil(targetTaskId) ? undefined : targetTaskId,
    end: sourceTimeEntry.end,
    tagIds: targetTagIds.length !== 0 ? targetTagIds : undefined,
  };

  const targetTimeEntry = yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${targetWorkspaceId}/time-entries`,
    {
      method: "POST",
      body: timeEntryRequest,
    },
  );

  return transformFromResponse(targetTimeEntry);
}

function* fetchClockifyTimeEntriesInWorkspace(
  workspaceId: string,
): SagaIterator<TimeEntryModel[]> {
  const clockifyTimeEntries: ClockifyTimeEntryResponseModel[] = yield call(
    paginatedClockifyFetch,
    `/clockify/api/v1/workspaces/${workspaceId}/time-entries`,
  );

  return clockifyTimeEntries.map(transformFromResponse);
}

function transformFromResponse(
  timeEntry: ClockifyTimeEntryResponseModel,
): TimeEntryModel {
  const startTime = getTime(timeEntry, "start");
  const tags = R.pathOr([], ["tags"], timeEntry);

  return {
    id: timeEntry.id,
    description: timeEntry.description,
    isBillable: timeEntry.billable,
    start: startTime,
    end: getTime(timeEntry, "end"),
    year: startTime.getFullYear(),
    isActive: false,
    clientId: "",
    projectId: timeEntry.project.id,
    tagIds: tags.map(({ id }: ClockifyTagResponseModel) => id),
    tagNames: tags.map(({ name }: ClockifyTagResponseModel) => name),
    taskId: timeEntry.task.id,
    userId: timeEntry.user.id,
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
