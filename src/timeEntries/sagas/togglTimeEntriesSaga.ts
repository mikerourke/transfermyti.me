/* eslint-disable @typescript-eslint/camelcase */
import R from "ramda";
import { call, put, select, delay } from "redux-saga/effects";
import qs from "qs";
import format from "date-fns/format";
import startOfYear from "date-fns/startOfYear";
import endOfYear from "date-fns/endOfYear";
import differenceInSeconds from "date-fns/differenceInSeconds";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import { selectCredentials } from "~/credentials/credentialsSelectors";
import {
  createTogglTimeEntries,
  fetchTogglTimeEntries,
} from "~/timeEntries/timeEntriesActions";
import { selectTargetTimeEntriesForTransfer } from "~/timeEntries/timeEntriesSelectors";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
import { TimeEntryModel } from "~/timeEntries/timeEntriesTypes";

interface TogglTotalCurrencyModel {
  currency: string | null;
  amount: number | null;
}

interface TogglTimeEntryResponseModel {
  id: number;
  pid: number;
  tid: number | null;
  uid: number;
  description: string;
  start: string;
  end: string;
  updated: string;
  dur: number;
  user: string;
  use_stop: boolean;
  client: string;
  project: string;
  project_color: string;
  project_hex_color: string;
  task: string | null; // Name of task
  billable: number | null;
  is_billable: boolean;
  cur: string | null;
  tags: string[];
}

interface TogglTimeEntriesFetchResponseModel {
  total_grand: number;
  total_billable: number | null;
  total_currencies: TogglTotalCurrencyModel[];
  total_count: number;
  per_page: number;
  data: TogglTimeEntryResponseModel[];
}

interface TogglTimeEntryRequestModel {
  time_entry: {
    description: string;
    tags?: string[];
    duration: number;
    start: string;
    wid: number;
    pid?: number;
    tid?: number;
    billable: boolean;
    created_with: string;
  };
}

export function* createTogglTimeEntriesSaga(
  action: ActionType<typeof createTogglTimeEntries.request>,
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
      // TODO: Add tagNames to this call.
      yield call(createTogglTimeEntry, timeEntry, []);
      yield delay(500);
    }

    yield put(createTogglTimeEntries.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTogglTimeEntries.failure());
  }
}

/**
 * Fetches all time entries in Toggl workspace and updates state with result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/reports/detailed.md#detailed-report
 */
export function* fetchTogglTimeEntriesSaga(
  action: ActionType<typeof fetchTogglTimeEntries.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const { togglEmail } = yield select(selectCredentials);
    const togglTimeEntries: TogglTimeEntryResponseModel[] = yield call(
      fetchAllTogglTimeEntries,
      togglEmail,
      workspaceId,
    );

    const recordsById: Record<string, TimeEntryModel> = {};

    for (const togglTimeEntry of togglTimeEntries) {
      const timeEntryId = togglTimeEntry.id.toString();
      recordsById[timeEntryId] = transformFromResponse(
        togglTimeEntry,
        workspaceId,
      );
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Toggl);

    yield put(fetchTogglTimeEntries.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTogglTimeEntries.failure());
  }
}

/**
 * Creates a Toggl time entry and returns the response as { data: [New TimeEntry] }.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/time_entries.md#create-a-time-entry
 */
function* createTogglTimeEntry(
  timeEntry: TimeEntryModel,
  tagNames: string[],
): SagaIterator {
  const timeEntryRequest = transformToRequest(timeEntry, tagNames);
  yield call(fetchObject, `/toggl/api/time_entries`, {
    method: HttpMethod.Post,
    body: timeEntryRequest,
  });
}

function* fetchAllTogglTimeEntries(
  email: string,
  workspaceId: string,
): SagaIterator<TimeEntryModel[]> {
  const allTimeEntries: TimeEntryModel[] = [];
  const currentYear = new Date().getFullYear();

  for (let year = 2007; year <= currentYear; year += 1) {
    const timeEntriesForYear = yield call(
      fetchTogglTimeEntriesForYear,
      email,
      workspaceId,
      year,
    );

    if (timeEntriesForYear.length !== 0) {
      allTimeEntries.push(...timeEntriesForYear);
    }

    yield delay(1000);
  }

  return allTimeEntries;
}

function* fetchTogglTimeEntriesForYear(
  email: string,
  workspaceId: string,
  year: number,
): SagaIterator<TogglTimeEntryResponseModel[]> {
  const {
    total_count: totalCount,
    per_page: perPage,
    data: firstPageEntries,
  } = yield call(
    fetchTogglTimeEntriesForYearAndPage,
    email,
    workspaceId,
    year,
    1,
  );

  if (totalCount === 0) {
    return [];
  }

  if (totalCount < perPage) {
    return firstPageEntries;
  }

  const allTimeEntries = firstPageEntries;
  const totalPages = Math.ceil(totalCount / perPage);

  for (let page = 2; page <= totalPages; page += 1) {
    const { data } = yield call(
      fetchTogglTimeEntriesForYearAndPage,
      email,
      workspaceId,
      year,
      page,
    );
    allTimeEntries.push(...data);
    yield delay(500);
  }

  return allTimeEntries;
}

function* fetchTogglTimeEntriesForYearAndPage(
  email: string,
  workspaceId: string,
  year: number,
  page: number,
): SagaIterator<TogglTimeEntriesFetchResponseModel> {
  const currentDate = new Date();
  currentDate.setFullYear(year);
  const DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
  const firstDay = format(startOfYear(currentDate), DATE_FORMAT);
  const lastDay = format(endOfYear(currentDate), DATE_FORMAT);

  const query = qs.stringify({
    workspace_id: workspaceId,
    since: firstDay,
    until: lastDay,
    user_agent: email,
    page: page,
  });

  return yield call(fetchObject, `/toggl/reports/details?${query}`);
}

function transformToRequest(
  timeEntry: TimeEntryModel,
  tagNames: string[],
): TogglTimeEntryRequestModel {
  return {
    time_entry: {
      description: timeEntry.description,
      tags: tagNames,
      duration: differenceInSeconds(timeEntry.end, timeEntry.start),
      start: timeEntry.start.toISOString(),
      wid: +timeEntry.workspaceId,
      pid: +timeEntry.projectId,
      tid: R.isNil(timeEntry.taskId) ? undefined : +timeEntry.taskId,
      billable: timeEntry.isBillable,
      created_with: "transfermyti.me",
    },
  };
}

function transformFromResponse(
  timeEntry: TogglTimeEntryResponseModel,
  workspaceId: string,
): TimeEntryModel {
  const startTime = getTime(timeEntry, "start");
  return {
    id: timeEntry.id.toString(),
    description: timeEntry.description,
    isBillable: timeEntry.is_billable,
    start: startTime,
    end: getTime(timeEntry, "end"),
    year: startTime.getFullYear(),
    isActive: false,
    clientId: null,
    projectId: timeEntry.pid.toString(),
    tagIds: [],
    tagNames: timeEntry.tags,
    taskId: R.isNil(timeEntry.tid) ? null : timeEntry.tid.toString(),
    userId: timeEntry.uid.toString(),
    userGroupIds: [],
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.TimeEntries,
  };
}

function getTime(
  timeEntry: TogglTimeEntryResponseModel,
  field: "start" | "end",
): Date {
  const value = R.pathOr(null, [field], null);
  return R.isNil(value) ? new Date() : new Date(value);
}
