import { call, put, select, delay } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import { ClockifyMembershipResponseModel } from "~/users/sagas/clockifyUsersSaga";
import {
  createClockifyWorkspaces,
  fetchClockifyWorkspaces,
} from "~/workspaces/workspacesActions";
import { selectTargetWorkspacesForTransfer } from "~/workspaces/workspacesSelectors";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
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

export function* createClockifyWorkspacesSaga(): SagaIterator {
  try {
    const workspaces: WorkspaceModel[] = yield select(
      selectTargetWorkspacesForTransfer,
    );
    yield call(startGroupTransfer, EntityGroup.Workspaces, workspaces.length);

    for (const workspace of workspaces) {
      yield call(incrementTransferCounts);
      yield call(createClockifyWorkspace, workspace);
      yield delay(500);
    }

    yield put(createClockifyWorkspaces.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createClockifyWorkspaces.failure());
  }
}

/**
 * Fetches all workspaces in Clockify workspace and updates state with result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces-get
 */
export function* fetchClockifyWorkspacesSaga(): SagaIterator {
  try {
    const clockifyWorkspaces: ClockifyWorkspaceResponseModel[] = yield call(
      fetchArray,
      "/clockify/api/v1/workspaces",
    );

    const recordsById: Record<string, WorkspaceModel> = {};

    for (const clockifyWorkspace of clockifyWorkspaces) {
      recordsById[clockifyWorkspace.id] = transformFromResponse(
        clockifyWorkspace,
      );
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Clockify);

    yield put(fetchClockifyWorkspaces.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClockifyWorkspaces.failure());
  }
}

/**
 * Creates a Clockify workspace and returns the response as { [New Workspace] }.
 * @see https://clockify.me/developers-api#operation--v1-workspaces-post
 */
function* createClockifyWorkspace(workspace: WorkspaceModel): SagaIterator {
  const workspaceRequest = transformToRequest(workspace);
  yield call(fetchObject, "/clockify/api/v1/workspaces", {
    method: HttpMethod.Post,
    body: workspaceRequest,
  });
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
