import { getFirstAndLastDayOfYear } from '../../utils';
import {
  ClockifyTimeEntry,
  TogglTimeEntriesFetchResponse,
} from '../../../types/timeEntriesTypes';

export const apiFetchClockifyTimeEntries = (
  userId: string,
  workspaceId: string,
  year: number,
): Promise<ClockifyTimeEntry[]> => {
  const { firstDay, lastDay } = getFirstAndLastDayOfYear(year);

  return fetch(
    `/clockify/api/workspaces/${workspaceId}/timeEntries/user/${userId}/entriesInRange`,
    {
      method: 'POST',
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
): Promise<TogglTimeEntriesFetchResponse> => {
  const { firstDay, lastDay } = getFirstAndLastDayOfYear(
    year,
    'YYYY-MM-DDTHH:mm:ssZ',
  );

  const queryString = [
    `workspace_id=${workspaceId}`,
    `since=${firstDay}`,
    `until=${lastDay}`,
    `user_agent=${email}`,
    `page=${page}`,
  ].join('&');

  return fetch(`/toggl/reports/details?${queryString}`);
};
