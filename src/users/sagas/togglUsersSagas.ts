import { SagaIterator } from "@redux-saga/types";
import { call, delay, put, select } from "redux-saga/effects";
import { TOGGL_API_DELAY } from "~/constants";
import * as reduxUtils from "~/redux/reduxUtils";
import { incrementEntityGroupTransferCompletedCount } from "~/allEntities/allEntitiesActions";
import { includedSourceProjectIdsSelector } from "~/projects/projectsSelectors";
import { includedSourceWorkspaceIdsSelector } from "~/workspaces/workspacesSelectors";
import { EntityGroup, ToolName, UserModel } from "~/typeDefs";

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

interface TogglProjectUserResponseModel {
  id: number;
  pid: number;
  uid: number;
  wid: number;
  manager: boolean;
  rate: number;
}

/**
 * Sends invites to the array of specified emails.
 */
export function* createTogglUsersSaga(
  emailsByWorkspaceId: Record<string, string[]>,
): SagaIterator {
  for (const [workspaceId, emails] of Object.entries(emailsByWorkspaceId)) {
    yield call(inviteTogglUsers, emails, workspaceId);
    yield put(incrementEntityGroupTransferCompletedCount(EntityGroup.Users));
    yield delay(TOGGL_API_DELAY);
  }
}

/**
 * Deletes all specified source users from Toggl projects that are included
 * for deletion.
 */
export function* deleteTogglUsersSaga(sourceUsers: UserModel[]): SagaIterator {
  const includedWorkspaceIds = yield select(includedSourceWorkspaceIdsSelector);
  const includedProjectIds = yield select(includedSourceProjectIdsSelector);

  // We can't actually delete a user, we can only remove them from the
  // workspace/project. In this case we're going to remove the user from each
  // included project that's being deleted.
  for (const workspaceId of includedWorkspaceIds) {
    const projectUsers: TogglProjectUserResponseModel[] = yield call(
      fetchProjectUsersInSourceWorkspace,
      workspaceId,
    );
    const projectUsersById = projectUsers.reduce(
      (acc, projectUser) => ({
        ...acc,
        [projectUser.id.toString()]: projectUser,
      }),
      {},
    );

    yield delay(TOGGL_API_DELAY);

    for (const sourceUser of sourceUsers) {
      // First, check if the source user to be deleted is associated with the
      // workspace projects:
      const matchingProjectUser = projectUsersById[sourceUser.id];
      if (matchingProjectUser) {
        // If they are, make sure that the project that the user is associated
        // with is going to be deleted:
        const isProjectIncluded = includedProjectIds.includes(
          matchingProjectUser.pid.toString(),
        );

        if (isProjectIncluded) {
          yield call(
            deleteTogglUserFromProject,
            matchingProjectUser.id.toString(),
          );

          yield put(
            incrementEntityGroupTransferCompletedCount(EntityGroup.Users),
          );

          yield delay(TOGGL_API_DELAY);
        }
      }
    }
  }
}

/**
 * Fetches all users in Toggl workspaces and returns array of transformed users.
 */
export function* fetchTogglUsersSaga(): SagaIterator<UserModel[]> {
  return yield call(reduxUtils.fetchEntitiesForTool, {
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
  yield call(
    reduxUtils.fetchObject,
    `/toggl/api/workspaces/${workspaceId}/invite`,
    {
      method: "POST",
      body: userRequest,
    },
  );
}

/**
 * Deletes the specified Toggl user from the specified project.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/project_users.md#delete-a-project-user
 */
function* deleteTogglUserFromProject(projectUserId: string): SagaIterator {
  yield call(
    reduxUtils.fetchEmpty,
    `/toggl/api/project_users/${projectUserId}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Fetches all the project users in a specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/project_users.md#get-list-of-project-users-in-a-workspace
 */
function* fetchProjectUsersInSourceWorkspace(
  workspaceId: string,
): SagaIterator<TogglProjectUserResponseModel[]> {
  const { data } = yield call(
    reduxUtils.fetchObject,
    `/toggl/api/workspaces/${workspaceId}/project_users`,
  );
  return data;
}

/**
 * Fetches Toggl users in the specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-users
 */
function* fetchTogglUsersInWorkspace(
  workspaceId: string,
): SagaIterator<UserModel[]> {
  const togglUsers: TogglUserResponseModel[] = yield call(
    reduxUtils.fetchArray,
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
    userGroupIds: user?.userGroupIds ?? [],
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Users,
  };
}
