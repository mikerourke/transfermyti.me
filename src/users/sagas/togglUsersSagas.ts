import { call, delay, put } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { TOGGL_API_DELAY } from "~/constants";
import {
  fetchArray,
  fetchEntitiesForTool,
  fetchObject,
} from "~/redux/sagaUtils";
import { incrementCurrentTransferCount } from "~/app/appActions";
import { EntityGroup, ToolName } from "~/common/commonTypes";
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

export function* createTogglUsersSaga(
  emailsByWorkspaceId: Record<string, string[]>,
): SagaIterator {
  for (const [workspaceId, emails] of Object.entries(emailsByWorkspaceId)) {
    yield put(incrementCurrentTransferCount());
    yield call(inviteTogglUsers, emails, workspaceId);
    yield delay(TOGGL_API_DELAY);
  }
}

/**
 * Fetches all users in Toggl workspaces and returns array of transformed users.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-users
 */
export function* fetchTogglUsersSaga(): SagaIterator<UserModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglUsersInWorkspace,
  });
}

/**
 * Invite Toggl users to a workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspace_users.md#invite-users-to-workspace
 */
function* inviteTogglUsers(
  sourceEmails: string[],
  workspaceId: string,
): SagaIterator {
  const userRequest = { emails: sourceEmails };
  yield call(fetchObject, `/toggl/api/workspaces/${workspaceId}/invite`, {
    method: "POST",
    body: userRequest,
  });
}

function* fetchTogglUsersInWorkspace(
  workspaceId: string,
): SagaIterator<UserModel[]> {
  const togglUsers: TogglUserResponseModel[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/users`,
  );

  return togglUsers.map(togglUser =>
    transformFromResponse(togglUser, workspaceId),
  );
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
