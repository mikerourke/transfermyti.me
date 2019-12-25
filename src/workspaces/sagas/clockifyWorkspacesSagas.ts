import { call, select, delay } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { CLOCKIFY_API_DELAY } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { ClockifyMembershipResponseModel } from "~/users/sagas/clockifyUsersSaga";
import { selectTargetWorkspacesForTransfer } from "~/workspaces/workspacesSelectors";
import { EntityGroup, HttpMethod } from "~/common/commonTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

interface ClockifyWorkspaceSettingsResponseModel {
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

interface ClockifyWorkspaceResponseModel {
  id: string;
  name: string;
  hourlyRate: {
    amount: number;
    currency: string;
  };
  memberships: ClockifyMembershipResponseModel[];
  workspaceSettings: ClockifyWorkspaceSettingsResponseModel;
  imageUrl: string;
}

interface ClockifyWorkspaceRequestModel {
  name: string;
}

/**
 * Creates Clockify workspaces for transfer and returns results.
 * @see https://clockify.me/developers-api#operation--v1-workspaces-post
 */
export function* createClockifyWorkspacesSaga(): SagaIterator<
  WorkspaceModel[]
> {
  const workspaces: WorkspaceModel[] = yield select(
    selectTargetWorkspacesForTransfer,
  );
  yield call(startGroupTransfer, EntityGroup.Workspaces, workspaces.length);

  const clockifyWorkspaces: ClockifyWorkspaceResponseModel[] = [];
  for (const workspace of workspaces) {
    yield call(incrementTransferCounts);

    const workspaceRequest = transformToRequest(workspace);
    const clockifyWorkspace = yield call(
      fetchObject,
      "/clockify/api/v1/workspaces",
      {
        method: HttpMethod.Post,
        body: workspaceRequest,
      },
    );
    clockifyWorkspaces.push(clockifyWorkspace);

    yield delay(CLOCKIFY_API_DELAY);
  }

  return clockifyWorkspaces.map(transformFromResponse);
}

/**
 * Fetches all workspaces in Clockify workspace and returns transformed result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces-get
 */
export function* fetchClockifyWorkspacesSaga(): SagaIterator<WorkspaceModel[]> {
  const clockifyWorkspaces: ClockifyWorkspaceResponseModel[] = yield call(
    fetchArray,
    "/clockify/api/v1/workspaces",
  );

  return clockifyWorkspaces.map(transformFromResponse);
}

function transformToRequest(
  workspace: WorkspaceModel,
): ClockifyWorkspaceRequestModel {
  return {
    name: workspace.name,
  };
}

function transformFromResponse(
  workspace: ClockifyWorkspaceResponseModel,
): WorkspaceModel {
  return {
    id: workspace.id,
    name: workspace.name,
    userIds: [],
    isAdmin: true,
    workspaceId: workspace.id,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Workspaces,
  };
}
