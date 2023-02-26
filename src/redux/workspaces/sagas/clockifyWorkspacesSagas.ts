import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { fetchArray } from "~/api/apiRequests";
import type { ClockifyMembershipResponse } from "~/redux/users/sagas/clockifyUsersSagas";
import { EntityGroup, type Workspace } from "~/typeDefs";

interface ClockifyWorkspaceSettingsResponse {
  timeRoundingInReports: boolean;
  onlyAdminsSeeBillableRates: boolean;
  onlyAdminsCreateProject: boolean;
  onlyAdminsSeeDashboard: boolean;
  defaultBillableProjects: boolean;
  lockTimeEntries: string | null;
  round: {
    round: string;
    minutes: string;
  };
  projectFavorites: boolean;
  canSeeTimeSheet: boolean;
  projectPickerSpecialFilter: boolean;
  forceProjects: boolean;
  forceTasks: boolean;
  forceTags: boolean;
  forceDescription: boolean;
  onlyAdminsSeeAllTimeEntries: boolean;
  onlyAdminsSeePublicProjectsEntries: boolean;
  trackTimeDownToSecond: boolean;
  projectGroupingLabel: string;
}

interface ClockifyWorkspaceResponse {
  id: string;
  name: string;
  hourlyRate: {
    amount: number;
    currency: string;
  };
  memberships: ClockifyMembershipResponse[];
  workspaceSettings: ClockifyWorkspaceSettingsResponse;
  imageUrl: string;
}

/**
 * Fetches all workspaces from Clockify and returns array of transformed
 * workspaces.
 * @see https://clockify.me/developers-api#operation--v1-workspaces-get
 */
export function* fetchClockifyWorkspacesSaga(): SagaIterator<Workspace[]> {
  const clockifyWorkspaces: ClockifyWorkspaceResponse[] = yield call(
    fetchArray,
    "/clockify/api/workspaces",
  );

  return clockifyWorkspaces.map(transformFromResponse);
}

function transformFromResponse(
  workspace: ClockifyWorkspaceResponse,
): Workspace {
  return {
    id: workspace.id,
    name: workspace.name,
    userIds: [],
    isAdmin: true,
    workspaceId: workspace.id,
    entryCount: 0,
    linkedId: null,
    isIncluded: false,
    memberOf: EntityGroup.Workspaces,
  };
}
