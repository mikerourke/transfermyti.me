import {
  ClockifyWorkspace,
  TogglSummaryReport,
  TogglWorkspace,
} from '../../../types/workspacesTypes';
import { getFirstAndLastDayOfYear } from '../../../utils/dateUtils';

export const apiFetchClockifyWorkspaces = (): Promise<ClockifyWorkspace[]> =>
  fetch('/clockify/api/workspaces/');

export const apiFetchTogglWorkspaces = (): Promise<TogglWorkspace[]> =>
  fetch('/toggl/api/workspaces');

export const apiFetchTogglWorkspaceSummaryForYear = (
  email: string,
  workspaceId: string,
  year: number,
): Promise<TogglSummaryReport> => {
  const { firstDay, lastDay } = getFirstAndLastDayOfYear(year, 'YYYY-MM-DD');

  const queryString = [
    `workspace_id=${workspaceId}`,
    `since=${firstDay}`,
    `until=${lastDay}`,
    `user_agent=${email}`,
  ].join('&');

  return fetch(`/toggl/reports/summary?${queryString}`);
};
