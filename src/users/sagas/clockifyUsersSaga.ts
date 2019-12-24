import { call, delay, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import {
  incrementTransferCounts,
  paginatedClockifyFetch,
  startGroupTransfer,
} from "~/redux/sagaUtils";
import { fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import { createClockifyUsers, fetchClockifyUsers } from "~/users/usersActions";
import { selectTargetUsersForTransfer } from "~/users/usersSelectors";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
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

interface ClockifyUsersRequestModel {
  emails: string[];
}

export function* createClockifyUsersSaga(
  action: ActionType<typeof createClockifyUsers.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const users: UserModel[] = yield select(
      selectTargetUsersForTransfer,
      workspaceId,
    );
    yield call(startGroupTransfer, EntityGroup.Users, users.length);
    yield call(incrementTransferCounts);

    const emails: string[] = [];
    for (const user of users) {
      emails.push(user.email);
    }
    yield call(inviteClockifyUsers, workspaceId, emails);
    yield delay(500);

    yield put(createClockifyUsers.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createClockifyUsers.failure());
  }
}

/**
 * Fetches all users in Clockify workspace and updates state with result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--users-get
 */
export function* fetchClockifyUsersSaga(
  action: ActionType<typeof fetchClockifyUsers.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const clockifyUsers: ClockifyUserResponseModel[] = yield call(
      paginatedClockifyFetch,
      `/clockify/api/v1/workspaces/${workspaceId}/users`,
    );

    const recordsById: Record<string, UserModel> = {};

    for (const clockifyUser of clockifyUsers) {
      recordsById[clockifyUser.id] = transformFromResponse(
        clockifyUser,
        workspaceId,
      );
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Clockify);

    yield put(fetchClockifyUsers.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClockifyUsers.failure());
  }
}

/**
 * Invites Clockify users to workspace and returns the response as a
 * ClockifyWorkspaceResponseModel.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--users-post
 * @deprecated Currently in the unstable API version.
 */
function* inviteClockifyUsers(
  workspaceId: string,
  emails: string[],
): SagaIterator {
  const usersRequest = transformToRequest(emails);
  yield call(fetchObject, `/clockify/api/workspaces/${workspaceId}/users`, {
    method: HttpMethod.Post,
    body: usersRequest,
  });
}

function transformToRequest(emails: string[]): ClockifyUsersRequestModel {
  return {
    emails,
  };
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
