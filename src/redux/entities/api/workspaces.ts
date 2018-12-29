import {
  ClockifyWorkspace,
  TogglSummaryReport,
  TogglWorkspace,
  TogglWorkspaceUser,
} from '../../../types/workspacesTypes';
import { getFirstAndLastDayOfYear } from '../../../utils/dateUtils';
import { ClockifyUser } from '../../../types/userTypes';

export const apiFetchClockifyWorkspaces = (): Promise<ClockifyWorkspace[]> =>
  fetch('/clockify/api/workspaces/');

export const apiFetchClockifyWorkspaceUsers = (
  workspaceId: string,
): Promise<ClockifyUser[]> =>
  fetch(`/clockify/api/workspaces/${workspaceId}/users/`);

export const apiFetchTogglWorkspaces = (): Promise<TogglWorkspace[]> =>
  fetch('/toggl/api/workspaces');

export const apiFetchTogglWorkspaceUsers = (
  workspaceId: string,
): Promise<TogglWorkspaceUser[]> =>
  fetch(`/toggl/api/workspaces/${workspaceId}/workspace_users`);

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
