import type { SagaIterator } from "redux-saga";
import { call, delay, put } from "redux-saga/effects";

import {
  fetchObject,
  fetchPaginatedFromClockify,
  getApiDelayForTool,
} from "~/entityOperations/apiRequests";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { entityGroupTransferCompletedCountIncremented } from "~/modules/allEntities/allEntitiesActions";
import { EntityGroup, ToolName, type User } from "~/typeDefs";

export interface ClockifyHourlyRateResponse {
  amount: number;
  currency: string;
}

export interface ClockifyMembershipResponse {
  hourlyRate: ClockifyHourlyRateResponse;
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

export interface ClockifyUserResponse {
  activeWorkspace: string;
  defaultWorkspace: string;
  email: string;
  id: string;
  memberships: ClockifyMembershipResponse[];
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
  const clockifyApiDelay = yield call(getApiDelayForTool, ToolName.Clockify);

  for (const [workspaceId, emails] of Object.entries(emailsByWorkspaceId)) {
    yield put(entityGroupTransferCompletedCountIncremented(EntityGroup.Users));

    yield call(inviteClockifyUsers, emails, workspaceId);

    yield delay(clockifyApiDelay);
  }
}

/**
 * Deletes all specified source clients from Clockify.
 */
export function* removeClockifyUsersSaga(sourceUsers: User[]): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceUsers,
    apiDeleteFunc: removeClockifyUserFromWorkspace,
  });
}

/**
 * Fetches all users in Clockify workspaces and returns array of transformed
 * users.
 */
export function* fetchClockifyUsersSaga(): SagaIterator<User[]> {
  return yield call(fetchEntitiesForTool, {
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
  const clockifyApiDelay = yield call(getApiDelayForTool, ToolName.Clockify);

  for (const email of sourceEmails) {
    const userRequest = { email };
    yield call(
      fetchObject,
      `/clockify/api/workspaces/${targetWorkspaceId}/users`,
      {
        method: "POST",
        body: userRequest,
      },
    );

    yield delay(clockifyApiDelay);
  }
}

/**
 * Removes the specified Clockify user from the workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--users--userId--delete
 */
function* removeClockifyUserFromWorkspace(sourceUser: User): SagaIterator {
  const { workspaceId, id } = sourceUser;
  yield call(
    fetchObject,
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
): SagaIterator<User[]> {
  const clockifyUsers: ClockifyUserResponse[] = yield call(
    fetchPaginatedFromClockify,
    `/clockify/api/workspaces/${workspaceId}/users`,
  );

  return clockifyUsers.map((clockifyUser) =>
    transformFromResponse(clockifyUser, workspaceId),
  );
}

function transformFromResponse(
  user: ClockifyUserResponse,
  workspaceId: string,
): User {
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
