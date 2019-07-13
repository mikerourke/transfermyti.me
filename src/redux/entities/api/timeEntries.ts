import { get, isNil } from "lodash";
import { firstAndLastDayOfYear } from "~/redux/utils";
import { fetchArray, fetchObject } from "./fetchByPayloadType";
import {
  ClockifyTimeEntryModel,
  DetailedTimeEntryModel,
  TogglTimeEntriesFetchResponseModel,
} from "~/types";

/**
 * Get time entries for specified userId in time range.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--timeEntries-user--userId--dateRange--get
 */
export const apiFetchClockifyTimeEntries = (
  userId: string,
  workspaceId: string,
  year: number,
): Promise<Array<ClockifyTimeEntryModel>> => {
  const { firstDay, lastDay } = firstAndLastDayOfYear(year);

  return fetchArray(
    `/clockify/api/workspaces/${workspaceId}/timeEntries/user/${userId}/entriesInRange`,
    {
      method: "POST",
      body: {
        start: firstDay,
        end: lastDay,
      } as any,
    },
  );
};

export const apiFetchTogglTimeEntries = (
  email: string,
  workspaceId: string,
  year: number,
  page: number = 1,
): Promise<TogglTimeEntriesFetchResponseModel> => {
  const { firstDay, lastDay } = firstAndLastDayOfYear(
    year,
    "YYYY-MM-DDTHH:mm:ssZ",
  );

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
    if (isNil(linkedId) || !isIncluded) return acc;
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

  return fetchObject(`/clockify/api/workspaces/${workspaceId}/timeEntries/`, {
    method: "POST",
    body: validTimeEntry as any,
  });
};
