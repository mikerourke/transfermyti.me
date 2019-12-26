import { call, delay, put } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { CLOCKIFY_API_DELAY } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { incrementCurrentTransferCount } from "~/app/appActions";
import { ClockifyMembershipResponseModel } from "~/users/sagas/clockifyUsersSagas";
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
export function* createClockifyWorkspacesSaga(
  sourceWorkspaces: WorkspaceModel[],
): SagaIterator<WorkspaceModel[]> {
  const targetWorkspaces: WorkspaceModel[] = [];

  for (const sourceWorkspace of sourceWorkspaces) {
    yield put(incrementCurrentTransferCount());

    const workspaceRequest = transformToRequest(sourceWorkspace);
    const targetWorkspace = yield call(
      fetchObject,
      "/clockify/api/v1/workspaces",
      {
        method: HttpMethod.Post,
        body: workspaceRequest,
      },
    );
    targetWorkspaces.push(transformFromResponse(targetWorkspace));

    yield delay(CLOCKIFY_API_DELAY);
  }

  return targetWorkspaces;
}

/**
 * Fetches all workspaces from Clockify and returns transformed result.
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
