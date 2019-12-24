import R from "ramda";
import { call, put, select, delay } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import {
  incrementTransferCounts,
  paginatedClockifyFetch,
  startGroupTransfer,
} from "~/redux/sagaUtils";
import { fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import {
  createClockifyTimeEntries,
  fetchClockifyTimeEntries,
} from "~/timeEntries/timeEntriesActions";
import { selectTargetTimeEntriesForTransfer } from "~/timeEntries/timeEntriesSelectors";
import { ClockifyProjectResponseModel } from "~/projects/sagas/clockifyProjectsSaga";
import { ClockifyTagResponseModel } from "~/tags/sagas/clockifyTagsSaga";
import { ClockifyTaskResponseModel } from "~/tasks/sagas/clockifyTasksSaga";
import { ClockifyUserResponseModel } from "~/users/sagas/clockifyUsersSaga";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
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

interface ClockifyTimeEntryRequestModel {
  start: Date;
  billable: boolean;
  description: string;
  projectId: string;
  taskId?: string;
  end?: Date;
  tagIds?: string[];
}

export function* createClockifyTimeEntriesSaga(
  action: ActionType<typeof createClockifyTimeEntries.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const timeEntries: TimeEntryModel[] = yield select(
      selectTargetTimeEntriesForTransfer,
      workspaceId,
    );
    yield call(startGroupTransfer, EntityGroup.TimeEntries, timeEntries.length);

    for (const timeEntry of timeEntries) {
      yield call(incrementTransferCounts);
      yield call(createClockifyTimeEntry, workspaceId, timeEntry);
      yield delay(500);
    }

    yield put(createClockifyTimeEntries.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createClockifyTimeEntries.failure());
  }
}

/**
 * Fetches all timeEntries in Clockify workspace and updates state with result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--timeEntries-get
 */
export function* fetchClockifyTimeEntriesSaga(
  action: ActionType<typeof fetchClockifyTimeEntries.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const clockifyTimeEntries: ClockifyTimeEntryResponseModel[] = yield call(
      paginatedClockifyFetch,
      `/clockify/api/v1/workspaces/${workspaceId}/time-entries`,
    );

    const recordsById: Record<string, TimeEntryModel> = {};

    for (const clockifyTimeEntry of clockifyTimeEntries) {
      recordsById[clockifyTimeEntry.id] = transformFromResponse(
        clockifyTimeEntry,
        workspaceId,
      );
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Clockify);

    yield put(fetchClockifyTimeEntries.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClockifyTimeEntries.failure());
  }
}

/**
 * Creates a Clockify timeEntry and returns the response as { [New TimeEntry] }.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--timeEntries-post
 */
function* createClockifyTimeEntry(
  workspaceId: string,
  timeEntry: TimeEntryModel,
): SagaIterator {
  const timeEntryRequest = transformToRequest(timeEntry, undefined);
  yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${workspaceId}/time-entries`,
    {
      method: HttpMethod.Post,
      body: timeEntryRequest,
    },
  );
}

function transformToRequest(
  timeEntry: TimeEntryModel,
  tagIds?: string[],
): ClockifyTimeEntryRequestModel {
  return {
    start: timeEntry.start,
    billable: timeEntry.isBillable,
    description: timeEntry.description,
    projectId: timeEntry.projectId,
    taskId: R.isNil(timeEntry.taskId) ? undefined : timeEntry.taskId,
    end: timeEntry.end,
    tagIds,
  };
}

function transformFromResponse(
  timeEntry: ClockifyTimeEntryResponseModel,
  workspaceId: string,
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
    workspaceId,
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
  const value = R.pathOr(null, ["timeInterval", field], null);
  return R.isNil(value) ? new Date() : new Date(value);
}
