import { call, put, select, delay } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import { createTogglUsers, fetchTogglUsers } from "~/users/usersActions";
import { selectSourceUsersForTransfer } from "~/users/usersSelectors";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
import { UserModel } from "~/users/usersTypes";

interface TogglUserResponseModel {
  id: number;
  default_wid: number;
  email: string;
  fullname: string;
  jquery_timeofday_format: string;
  jquery_date_format: string;
  timeofday_format: string;
  date_format: string;
  store_start_and_stop_time: boolean;
  beginning_of_week: number;
  language: string;
  image_url: string;
  sidebar_piechart: false;
  at: string;
  retention: number;
  record_timeline: boolean;
  render_timeline: boolean;
  timeline_enabled: boolean;
  timeline_experiment: boolean;
  new_blog_post: unknown;
  should_upgrade: boolean;
  invitation: unknown;
  userGroupIds?: string[];
}

interface TogglUserRequestModel {
  emails: string[];
}

export function* createTogglUsersSaga(
  action: ActionType<typeof createTogglUsers.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const users: UserModel[] = yield select(
      selectSourceUsersForTransfer,
      workspaceId,
    );
    yield call(startGroupTransfer, EntityGroup.Users, users.length);
    yield call(incrementTransferCounts);

    const emails: string[] = [];
    for (const user of users) {
      emails.push(user.email);
    }
    yield call(inviteTogglUsers, workspaceId, emails);
    yield delay(500);

    yield put(createTogglUsers.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTogglUsers.failure());
  }
}

/**
 * Fetches all users in Toggl workspace and updates state with result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-users
 */
export function* fetchTogglUsersSaga(
  action: ActionType<typeof fetchTogglUsers.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const togglUsers: TogglUserResponseModel[] = yield call(
      fetchArray,
      `/toggl/api/workspaces/${workspaceId}/users`,
    );

    const recordsById: Record<string, UserModel> = {};

    for (const togglUser of togglUsers) {
      const userId = togglUser.id.toString();
      recordsById[userId] = transformFromResponse(togglUser, workspaceId);
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Toggl);

    yield put(fetchTogglUsers.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTogglUsers.failure());
  }
}

/**
 * Invite Toggl users to a workspace and returns the response as
 * { data: [New User] }.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspace_users.md#invite-users-to-workspace
 */
function* inviteTogglUsers(
  workspaceId: string,
  emails: string[],
): SagaIterator {
  const userRequest = transformToRequest(emails);
  yield call(fetchObject, `/toggl/api/workspaces/${workspaceId}/invite`, {
    method: HttpMethod.Post,
    body: userRequest,
  });
}

function transformToRequest(emails: string[]): TogglUserRequestModel {
  return {
    emails,
  };
}

function transformFromResponse(
  user: TogglUserResponseModel,
  workspaceId: string,
): UserModel {
  return {
    id: user.id.toString(),
    name: user.fullname,
    email: user.email,
    isAdmin: null,
    isActive: true,
    userGroupIds: user.userGroupIds || [],
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Users,
  };
}
