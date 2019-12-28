import { call, delay, put } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { CLOCKIFY_API_DELAY } from "~/constants";
import {
  fetchEntitiesForTool,
  fetchObject,
  paginatedClockifyFetch,
} from "~/redux/sagaUtils";
import { incrementCurrentTransferCount } from "~/app/appActions";
import { EntityGroup, ToolName } from "~/entities/entitiesTypes";
import { UserModel } from "~/users/usersTypes";

export interface ClockifyHourlyRateResponseModel {
  amount: number;
  currency: string;
}

export interface ClockifyMembershipResponseModel {
  hourlyRate: ClockifyHourlyRateResponseModel;
  membershipStatus: string;
  membershipType: string;
  targetId: string;
  userId: string;
}

type WeekStart =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface ClockifyUserResponseModel {
  activeWorkspace: string;
  defaultWorkspace: string;
  email: string;
  id: string;
  memberships: ClockifyMembershipResponseModel[];
  name: string;
  profilePicture: string;
  settings: {
    collapseAllProjectLists: boolean;
    dashboardPinToTop: boolean;
    dashboardSelection: "ME" | "TEAM";
    dashboardViewType: "PROJECT" | "BILLABILITY";
    dateFormat: string;
    isCompactViewOn: boolean;
    longRunning: boolean;
    projectListCollapse: number;
    sendNewsletter: boolean;
    summaryReportSettings: {
      group: string;
      subgroup: string;
    };
    timeFormat: string;
    timeTrackingManual: boolean;
    timeZone: string;
    weekStart: WeekStart;
    weeklyUpdates: boolean;
  };
  status: "ACTIVE" | "PENDING_EMAIL_VERIFICATION" | "DELETED";
}

export function* createClockifyUsersSaga(
  emailsByWorkspaceId: Record<string, string[]>,
): SagaIterator {
  for (const [workspaceId, emails] of Object.entries(emailsByWorkspaceId)) {
    yield put(incrementCurrentTransferCount());
    yield call(inviteClockifyUsers, emails, workspaceId);
    yield delay(CLOCKIFY_API_DELAY);
  }
}

/**
 * Fetches all users in Clockify workspaces and returns array of transformed
 * users.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--users-get
 */
export function* fetchClockifyUsersSaga(): SagaIterator<UserModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyUsersInWorkspace,
  });
}

/**
 * Invites Clockify users to workspace.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--users-post
 * @deprecated Currently in the unstable API version.
 */
function* inviteClockifyUsers(
  sourceEmails: string[],
  targetWorkspaceId: string,
): SagaIterator {
  const usersRequest = { emails: sourceEmails };
  yield call(
    fetchObject,
    `/clockify/api/workspaces/${targetWorkspaceId}/users`,
    {
      method: "POST",
      body: usersRequest,
    },
  );
}

function* fetchClockifyUsersInWorkspace(
  workspaceId: string,
): SagaIterator<UserModel[]> {
  const clockifyUsers: ClockifyUserResponseModel[] = yield call(
    paginatedClockifyFetch,
    `/clockify/api/v1/workspaces/${workspaceId}/users`,
  );

  return clockifyUsers.map(clockifyUser =>
    transformFromResponse(clockifyUser, workspaceId),
  );
}

function transformFromResponse(
  user: ClockifyUserResponseModel,
  workspaceId: string,
): UserModel {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: null,
    isActive: user.status === "ACTIVE",
    userGroupIds: [],
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Users,
  };
}
