import { get, isNil } from "lodash";
import qs from "qs";
import { API_PAGE_SIZE } from "~/constants";
import {
  fetchArray,
  fetchObject,
  firstAndLastDayOfYear,
  DateFormat,
} from "~/utils";
import {
  ClockifyTimeEntryModel,
  DetailedTimeEntryModel,
  TogglTimeEntriesFetchResponseModel,
} from "./timeEntriesTypes";

/**
 * Get time entries for specified userId in time range.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--timeEntries-user--userId--dateRange--get
 */
export const apiFetchClockifyTimeEntries = (
  userId: string,
  workspaceId: string,
  page: number,
): Promise<ClockifyTimeEntryModel[]> => {
  const query = qs.stringify({ page, "page-size": API_PAGE_SIZE });
  return fetchArray(
    `/clockify/api/v1/workspaces/${workspaceId}/user/${userId}/time-entries?${query}`,
  );
};

export const apiFetchTogglTimeEntries = (
  email: string,
  workspaceId: string,
  year: number,
  page = 1,
): Promise<TogglTimeEntriesFetchResponseModel> => {
  const { firstDay, lastDay } = firstAndLastDayOfYear(year, DateFormat.Long);

  const queryString = [
    `workspace_id=${workspaceId}`,
    `since=${firstDay}`,
    `until=${lastDay}`,
    `user_agent=${email}`,
    `page=${page}`,
  ].join("&");

  return fetchObject(`/toggl/reports/details?${queryString}`);
};

/**
 * Create a new time entry on Clockify.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--timeEntries--post
 */
export const apiCreateClockifyTimeEntry = (
  workspaceId: string,
  timeEntry: DetailedTimeEntryModel,
): Promise<ClockifyTimeEntryModel> => {
  const tagIds = timeEntry.tags.reduce((acc, { linkedId, isIncluded }) => {
    if (isNil(linkedId) || !isIncluded) {
      return acc;
    }
    return [...acc, linkedId];
  }, []);

  const validTimeEntry = {
    start: timeEntry.start,
    billable: timeEntry.isBillable,
    description: timeEntry.description,
    end: timeEntry.end,
    projectId: get(timeEntry, ["project", "linkedId"], null),
    taskId: get(timeEntry, ["task", "linkedId"], null),
    tagIds,
  };

  return fetchObject(
    `/clockify/api/v1/workspaces/${workspaceId}/time-entries`,
    {
      method: "POST",
      body: validTimeEntry as unknown,
    },
  );
};
