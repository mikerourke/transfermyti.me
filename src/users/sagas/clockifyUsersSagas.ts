import { SagaIterator } from "@redux-saga/types";

import { call, delay, put } from "redux-saga/effects";

import { incrementEntityGroupTransferCompletedCount } from "~/allEntities/allEntitiesActions";
import { CLOCKIFY_API_DELAY } from "~/constants";
import * as reduxUtils from "~/redux/reduxUtils";
import { EntityGroup, ToolName, UserModel } from "~/typeDefs";

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

/**
 * Sends invites to the array of specified emails.
 */
export function* createClockifyUsersSaga(
  emailsByWorkspaceId: Record<string, string[]>,
): SagaIterator {
  for (const [workspaceId, emails] of Object.entries(emailsByWorkspaceId)) {
    yield put(incrementEntityGroupTransferCompletedCount(EntityGroup.Users));
    yield call(inviteClockifyUsers, emails, workspaceId);
    yield delay(CLOCKIFY_API_DELAY);
  }
}

/**
 * Deletes all specified source clients from Clockify.
 */
export function* removeClockifyUsersSaga(
  sourceUsers: UserModel[],
): SagaIterator {
  yield call(reduxUtils.deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceUsers,
    apiDeleteFunc: removeClockifyUserFromWorkspace,
  });
}

/**
 * Fetches all users in Clockify workspaces and returns array of transformed
 * users.
 */
export function* fetchClockifyUsersSaga(): SagaIterator<UserModel[]> {
  return yield call(reduxUtils.fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyUsersInWorkspace,
  });
}

/**
 * Invites Clockify users to workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--users-post
 */
function* inviteClockifyUsers(
  sourceEmails: string[],
  targetWorkspaceId: string,
): SagaIterator {
  for (const email of sourceEmails) {
    const userRequest = { email };
    yield call(
      reduxUtils.fetchObject,
      `/clockify/api/workspaces/${targetWorkspaceId}/users`,
      {
        method: "POST",
        body: userRequest,
      },
    );

    yield delay(CLOCKIFY_API_DELAY);
  }
}

/**
 * Removes the specified Clockify user from the workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--users--userId--delete
 */
function* removeClockifyUserFromWorkspace(sourceUser: UserModel): SagaIterator {
  const { workspaceId, id } = sourceUser;
  yield call(
    reduxUtils.fetchObject,
    `/clockify/api/workspaces/${workspaceId}/users/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify users in specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--users-get
 */
function* fetchClockifyUsersInWorkspace(
  workspaceId: string,
): SagaIterator<UserModel[]> {
  const clockifyUsers: ClockifyUserResponseModel[] = yield call(
    reduxUtils.fetchPaginatedFromClockify,
    `/clockify/api/workspaces/${workspaceId}/users`,
  );

  return clockifyUsers.map((clockifyUser) =>
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
