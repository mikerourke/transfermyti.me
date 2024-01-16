import type { SagaIterator } from "redux-saga";
import { call, delay, put, select } from "redux-saga/effects";

import {
  fetchArray,
  fetchEmpty,
  fetchObject,
  getApiDelayForTool,
} from "~/api/apiRequests";
import { fetchEntitiesForTool } from "~/api/fetchEntitiesForTool";
import { entityGroupTransferCompletedCountIncremented } from "~/redux/allEntities/allEntitiesActions";
import { includedSourceProjectIdsSelector } from "~/redux/projects/projectsSelectors";
import { includedSourceWorkspaceIdsSelector } from "~/redux/workspaces/workspacesSelectors";
import { EntityGroup, ToolName, type User } from "~/types";
import { validStringify } from "~/utilities/textTransforms";

export type TogglUserResponse = {
  api_token: string;
  at: string;
  beginning_of_week: number;
  country_id: number;
  created_at: string;
  default_workspace_id: number;
  email: string;
  fullname: string;
  has_password: boolean;
  id: number;
  image_url: string;
  intercom_hash: string;
  openid_email: string | null;
  openid_enabled: boolean;
  timezone: string;
  updated_at: string;
};

type TogglProjectUserResponse = {
  id: number;
  manager: boolean;
  pid: number;
  rate: number;
  uid: number;
  wid: number;
};

/**
 * Sends invites to the array of specified emails.
 */
export function* createTogglUsersSaga(
  emailsByWorkspaceId: Dictionary<string[]>,
): SagaIterator {
  const togglApiDelay = yield call(getApiDelayForTool, ToolName.Toggl);

  for (const [workspaceId, emails] of Object.entries(emailsByWorkspaceId)) {
    yield call(inviteTogglUsers, emails, workspaceId);

    yield put(entityGroupTransferCompletedCountIncremented(EntityGroup.Users));

    yield delay(togglApiDelay);
  }
}

/**
 * Removes all specified source users from Toggl projects that are included
 * for deletion.
 */
export function* removeTogglUsersSaga(sourceUsers: User[]): SagaIterator {
  const includedWorkspaceIds = yield select(includedSourceWorkspaceIdsSelector);

  const includedProjectIds = yield select(includedSourceProjectIdsSelector);

  const togglApiDelay = yield call(getApiDelayForTool, ToolName.Toggl);

  // We can't actually delete a user, we can only remove them from the
  // workspace/project. In this case we're going to remove the user from each
  // included project that's being deleted.
  for (const workspaceId of includedWorkspaceIds) {
    const projectUsers: TogglProjectUserResponse[] = yield call(
      fetchProjectUsersInSourceWorkspace,
      workspaceId,
    );

    const projectUsersById: Dictionary<TogglProjectUserResponse> = {};

    for (const projectUser of projectUsers) {
      if ((projectUser?.id ?? null) === null) {
        continue;
      }

      projectUsersById[projectUser.id.toString()] = projectUser;
    }

    yield delay(togglApiDelay);

    for (const sourceUser of sourceUsers) {
      // First, check if the source user to be deleted is associated with the
      // workspace projects:
      const matchingProjectUser = projectUsersById[sourceUser.id] ?? null;

      if (matchingProjectUser !== null) {
        // If they are, make sure that the project that the user is associated
        // with is going to be deleted:
        const isProjectIncluded = includedProjectIds.includes(
          validStringify(matchingProjectUser.pid, ""),
        );

        const projectUserId = matchingProjectUser.id ?? null;

        if (isProjectIncluded && projectUserId !== null) {
          yield call(removeTogglUserFromProject, projectUserId.toString());

          // prettier-ignore
          yield put(entityGroupTransferCompletedCountIncremented(EntityGroup.Users));

          yield delay(togglApiDelay);
        }
      }
    }
  }
}

/**
 * Fetches all users in Toggl workspaces and returns array of transformed users.
 */
export function* fetchTogglUsersSaga(): SagaIterator<User[]> {
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

/**
 * Deletes the specified Toggl user from the specified project.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/project_users.md#delete-a-project-user
 */
function* removeTogglUserFromProject(projectUserId: string): SagaIterator {
  yield call(fetchEmpty, `/toggl/api/project_users/${projectUserId}`, {
    method: "DELETE",
  });
}

/**
 * Fetches all the project users in a specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/project_users.md#get-list-of-project-users-in-a-workspace
 */
function* fetchProjectUsersInSourceWorkspace(
  workspaceId: string,
): SagaIterator<TogglProjectUserResponse[]> {
  const { data } = yield call(
    fetchObject,
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
): SagaIterator<User[]> {
  const togglUsers: TogglUserResponse[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/users`,
  );

  return togglUsers.map((togglUser) =>
    transformFromResponse(togglUser, workspaceId),
  );
}

function transformFromResponse(
  user: TogglUserResponse,
  workspaceId: string,
): User {
  return {
    id: user.id.toString(),
    name: user.fullname,
    email: user.email,
    isAdmin: null,
    isActive: true,
    // TODO: Find out where to get this from in the new API.
    userGroupIds: [],
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Users,
  };
}
