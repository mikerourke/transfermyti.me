import { firstAndLastDayOfYear } from '~/redux/utils';
import { fetchArray, fetchObject } from './fetchByPayloadType';
import {
  ClockifyWorkspaceModel,
  EntityWithName,
  HttpMethod,
  TogglSummaryReportModel,
} from '~/types';

export const apiFetchClockifyWorkspaces = (): Promise<
  Array<ClockifyWorkspaceModel>
> => fetchArray('/clockify/api/workspaces/');

export const apiFetchTogglWorkspaceSummaryForYear = (
  email: string,
  workspaceId: string,
  year: number,
): Promise<TogglSummaryReportModel> => {
  const { firstDay, lastDay } = firstAndLastDayOfYear(year, 'YYYY-MM-DD');

  const queryString = [
    `workspace_id=${workspaceId}`,
    `since=${firstDay}`,
    `until=${lastDay}`,
    `user_agent=${email}`,
  ].join('&');

  return fetchObject(`/toggl/reports/summary?${queryString}`);
};

export const apiCreateClockifyWorkspace = (
  workspace: EntityWithName,
): Promise<ClockifyWorkspaceModel> =>
  fetchObject('/clockify/api/workspaces/', {
    method: HttpMethod.Post,
    body: workspace as any,
  });
