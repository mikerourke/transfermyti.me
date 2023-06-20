import differenceInSeconds from "date-fns/differenceInSeconds";
import endOfYear from "date-fns/endOfYear";
import format from "date-fns/format";
import startOfYear from "date-fns/startOfYear";
import { isNil, propOr } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, delay, select } from "redux-saga/effects";

import { fetchEmpty, fetchObject, getApiDelayForTool } from "~/api/apiRequests";
import { createEntitiesForTool } from "~/api/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/api/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/api/fetchEntitiesForTool";
import { clientIdsByNameSelectorFactory } from "~/redux/clients/clients.selectors";
import { credentialsByToolNameSelector } from "~/redux/credentials/credentials.selectors";
import { projectIdToLinkedIdSelector } from "~/redux/projects/projects.selectors";
import { tagIdsByNameBySelectorFactory } from "~/redux/tags/tags.selectors";
import { taskIdToLinkedIdSelector } from "~/redux/tasks/tasks.selectors";
import { EntityGroup, ToolName, type TimeEntry } from "~/types";
import { validStringify } from "~/utilities/textTransforms";

const togglApiDelay = getApiDelayForTool(ToolName.Toggl);

interface TogglReportsTimeEntryResponse {
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

/**
 * Response from Toggl API for time entries.
 * @see https://developers.track.toggl.com/docs/api/time_entries#response
 */
interface TogglTrackTimeEntryResponse {
  id: number;
  project_id: number;
  task_id: number | null;
  user_id: number;
  workspace_id: number;
  description: string;
  start: string;
  stop: string;
  at: string;
  server_deleted_at: string | null;
  duration: number;
  duronly: boolean;
  billable: boolean;
  tag_ids: number[];
  tags: string[];
}

type TogglTimeEntryResponse =
  | TogglTrackTimeEntryResponse
  | TogglReportsTimeEntryResponse;

interface TogglTotalCurrency {
  currency: string | null;
  amount: number | null;
}

interface TogglTimeEntriesFetchResponse {
  total_grand: number;
  total_billable: number | null;
  total_currencies: TogglTotalCurrency[];
  total_count: number;
  per_page: number;
  data: TogglTimeEntryResponse[];
}

/**
 * Creates Toggl time entries in all workspaces and returns array of transformed
 * time entries.
 */
export function* createTogglTimeEntriesSaga(
  sourceTimeEntries: TimeEntry[],
): SagaIterator<TimeEntry[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTimeEntries,
    apiCreateFunc: createTogglTimeEntry,
  });
}

/**
 * Deletes all specified source time entries from Toggl.
 */
export function* deleteTogglTimeEntriesSaga(
  sourceTimeEntries: TimeEntry[],
): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTimeEntries,
    apiDeleteFunc: deleteTogglTimeEntry,
  });
}

/**
 * Fetches all time entries in Toggl workspaces and returns array of
 * transformed time entries.
 */
export function* fetchTogglTimeEntriesSaga(): SagaIterator<TimeEntry[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglTimeEntriesInWorkspace,
  });
}

/**
 * Creates a new Toggl time entry.
 * @see https://developers.track.toggl.com/docs/api/time_entries#post-timeentries
 */
function* createTogglTimeEntry(
  sourceTimeEntry: TimeEntry,
  targetWorkspaceId: string,
): SagaIterator {
  const projectIdToLinkedId = yield select(projectIdToLinkedIdSelector);

  const targetProjectId = propOr<string | null, Dictionary<string>, string>(
    null,
    sourceTimeEntry.projectId ?? "",
    projectIdToLinkedId,
  );

  const taskIdToLinkedId = yield select(taskIdToLinkedIdSelector);

  const targetTaskId = propOr<string | null, Dictionary<string>, string>(
    null,
    sourceTimeEntry.taskId ?? "",
    taskIdToLinkedId,
  );

  const body = {
    description: sourceTimeEntry.description,
    tags: sourceTimeEntry.tagNames,
    duration: differenceInSeconds(sourceTimeEntry.end, sourceTimeEntry.start),
    start: sourceTimeEntry.start.toISOString(),
    stop: sourceTimeEntry.end.toISOString(),
    workspace_id: +targetWorkspaceId,
    project_id: isNil(targetProjectId) ? undefined : +targetProjectId,
    task_id: isNil(targetTaskId) ? undefined : +targetTaskId,
    billable: sourceTimeEntry.isBillable,
    created_with: "transfermyti.me",
  };

  yield call(
    fetchObject,
    `/toggl/api/workspaces/${targetWorkspaceId}/time_entries`,
    {
      method: "POST",
      body,
    },
  );
}

/**
 * Deletes the specified Toggl time entry.
 * @see https://developers.track.toggl.com/docs/api/time_entries#delete-timeentries
 */
function* deleteTogglTimeEntry(sourceTimeEntry: TimeEntry): SagaIterator {
  const { workspaceId, id } = sourceTimeEntry;

  yield call(
    fetchEmpty,
    `/toggl/api/workspaces/${workspaceId}/time_entries/${id}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Fetches Toggl time entries in the specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/reports/detailed.md#detailed-report
 */
function* fetchTogglTimeEntriesInWorkspace(
  workspaceId: string,
): SagaIterator<TimeEntry[]> {
  const credentialsByToolName = yield select(credentialsByToolNameSelector);

  const togglUserId = credentialsByToolName?.toggl?.userId ?? null;
  if (togglUserId === null) {
    throw new Error("Invalid or missing Toggl user ID");
  }

  const togglTimeEntries: TogglReportsTimeEntryResponse[] = [];

  const currentYear = new Date().getFullYear();

  const clientIdsByName = yield select(
    clientIdsByNameSelectorFactory(ToolName.Toggl),
  );

  const tagIdsByName = yield select(
    tagIdsByNameBySelectorFactory(ToolName.Toggl),
  );

  for (let year = 2007; year <= currentYear; year += 1) {
    const timeEntriesForYear = yield call(
      fetchAllTogglTimeEntriesForYear,
      togglUserId,
      workspaceId,
      year,
    );

    if (timeEntriesForYear.length !== 0) {
      togglTimeEntries.push(...timeEntriesForYear);
    }

    yield delay(togglApiDelay);
  }

  const transformedTimeEntries: TimeEntry[] = [];

  for (const togglTimeEntry of togglTimeEntries) {
    const validUserId = togglTimeEntry?.uid ?? 0;

    // Extra check to ensure we only transfer time entries for the user
    // associated with the API key:
    if (validUserId.toString() !== togglUserId) {
      continue;
    }

    const clientId = propOr<null, string, string>(
      null,
      togglTimeEntry.client,
      clientIdsByName,
    );

    const transformedEntry = transformFromTogglReportsResponse(
      togglTimeEntry,
      workspaceId,
      clientId,
      tagIdsByName,
    );

    transformedTimeEntries.push(transformedEntry);
  }

  return transformedTimeEntries;
}

function* fetchAllTogglTimeEntriesForYear(
  userId: string,
  workspaceId: string,
  year: number,
): SagaIterator<TogglTimeEntryResponse[]> {
  const {
    total_count: totalCount,
    per_page: perPage,
    data: firstPageEntries,
  } = yield call(
    fetchTogglTimeEntriesForYearAndPage,
    userId,
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
      userId,
      workspaceId,
      year,
      page,
    );
    allTimeEntries.push(...data);

    yield delay(togglApiDelay);
  }

  return allTimeEntries;
}

function* fetchTogglTimeEntriesForYearAndPage(
  userId: string,
  workspaceId: string,
  year: number,
  page: number,
): SagaIterator<TogglTimeEntriesFetchResponse> {
  const currentDate = new Date();

  currentDate.setFullYear(year);

  const DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

  const firstDay = format(startOfYear(currentDate), DATE_FORMAT);
  const lastDay = format(endOfYear(currentDate), DATE_FORMAT);

  const query = new URLSearchParams({
    workspace_id: workspaceId,
    since: firstDay,
    until: lastDay,
    user_agent: "transfermyti.me",
    user_ids: userId,
    page: page.toString(),
  }).toString();

  return yield call(fetchObject, `/toggl/reports/details?${query}`);
}

function transformFromTogglReportsResponse(
  timeEntry: TogglReportsTimeEntryResponse,
  workspaceId: string,
  clientId: string | null,
  tagIdsByName: Dictionary<string>,
): TimeEntry {
  const startTime = getTime(timeEntry, "start");

  const tagNames = timeEntry.tags ?? [];

  const tagIds = tagNames.map((tagName) => tagIdsByName[tagName]);

  return {
    id: timeEntry.id.toString(),
    description: timeEntry.description,
    isBillable: timeEntry.is_billable,
    start: startTime,
    end: getTime(timeEntry, "end"),
    year: startTime.getFullYear(),
    isActive: false,
    clientId,
    projectId: validStringify(timeEntry?.pid, null),
    tagIds,
    tagNames,
    taskId: validStringify(timeEntry?.tid, null),
    userId: validStringify(timeEntry?.uid, null),
    userGroupIds: [],
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.TimeEntries,
  };
}

function getTime(
  timeEntry: TogglTimeEntryResponse,
  field: "start" | "end" | "stop",
): Date {
  const value = propOr<null, TogglTimeEntryResponse, string>(
    null,
    field,
    timeEntry,
  );

  return isNil(value) ? new Date() : new Date(value);
}
