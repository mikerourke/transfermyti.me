import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { fetchArray } from "~/api/apiRequests";
import type {
  ClockifyMembershipResponse,
  ClockifyRateResponse,
} from "~/redux/users/sagas/clockifyUsersSagas";
import { EntityGroup, type Workspace } from "~/types";

type ClockifyWorkspaceSettingsResponse = {
  adminOnlyPages: string[];
  automaticLock: unknown | null;
  canSeeTimeSheet: boolean;
  canSeeTracker: boolean;
  currencyFormat: string;
  defaultBillableProjects: boolean;
  forceDescription: boolean;
  forceProjects: boolean;
  forceTags: boolean;
  forceTasks: boolean;
  isProjectPublicByDefault: boolean;
  lockTimeEntries: string | null;
  lockTimeZone: string | null;
  multiFactorEnabled: boolean;
  numberFormat: string;
  onlyAdminsCreateProject: boolean;
  onlyAdminsCreateTag: boolean;
  onlyAdminsCreateTask: boolean;
  onlyAdminsSeeAllTimeEntries: boolean;
  onlyAdminsSeeBillableRates: boolean;
  onlyAdminsSeeDashboard: boolean;
  onlyAdminsSeePublicProjectsEntries: boolean;
  projectFavorites: boolean;
  projectGroupingLabel: string;
  projectPickerSpecialFilter: boolean;
  round: { round: string; minutes: string };
  timeRoundingInReports: boolean;
  timeTrackingMode: string;
  trackTimeDownToSecond: boolean;
};

type ClockifyCurrencyResponse = {
  code: string;
  id: string;
  isDefault: boolean;
};

type ClockifyWorkspaceResponse = {
  costRate: ClockifyRateResponse | null;
  currencies: ClockifyCurrencyResponse[];
  featureSubscriptionType: string;
  features: string[];
  hourlyRate: ClockifyRateResponse;
  id: string;
  imageUrl: string;
  memberships: ClockifyMembershipResponse[];
  name: string;
  workspaceSettings: ClockifyWorkspaceSettingsResponse;
};

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
    isPaid: workspace.featureSubscriptionType !== "FREE",
    workspaceId: workspace.id,
    entryCount: 0,
    linkedId: null,
    isIncluded: false,
    memberOf: EntityGroup.Workspaces,
  };
}
