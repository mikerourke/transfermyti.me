import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { get } from 'lodash';
import {
  apiAddClockifyUsersToWorkspace,
  apiFetchClockifyUsersInWorkspace,
  apiFetchTogglUsersInWorkspace,
  apiFetchTogglWorkspaceUsers,
} from '~/redux/entities/api/users';
import {
  showFetchErrorNotification,
  updateInTransferEntity,
} from '~/redux/app/appActions';
import { selectUsersInvitePayloadForWorkspace } from './usersSelectors';
import { appendUserIdsToWorkspace } from '~/redux/entities/workspaces/workspacesActions';
import { ReduxDispatch, ReduxGetState, ToolName } from '~/types/commonTypes';
import { ClockifyUser, TogglUser } from '~/types/usersTypes';
import { EntityType } from '~/types/entityTypes';

export const clockifyUsersFetch = createAsyncAction(
  '@users/CLOCKIFY_FETCH_REQUEST',
  '@users/CLOCKIFY_FETCH_SUCCESS',
  '@users/CLOCKIFY_FETCH_FAILURE',
)<void, ClockifyUser[], void>();

export const togglUsersFetch = createAsyncAction(
  '@users/TOGGL_FETCH_REQUEST',
  '@users/TOGGL_FETCH_SUCCESS',
  '@users/TOGGL_FETCH_FAILURE',
)<void, TogglUser[], void>();

export const clockifyUsersTransfer = createAsyncAction(
  '@users/CLOCKIFY_TRANSFER_REQUEST',
  '@users/CLOCKIFY_TRANSFER_SUCCESS',
  '@users/CLOCKIFY_TRANSFER_FAILURE',
)<void, void, void>();

export const flipIsUserIncluded = createStandardAction(
  '@users/FLIP_IS_INCLUDED',
)<string>();

const appendUserIdsToWorkspaceForTool = (
  toolName: ToolName,
  users: Array<ClockifyUser | TogglUser>,
  workspaceId: string,
) => (dispatch: ReduxDispatch) => {
  const userIds = users.map(({ id }) => id.toString());
  return dispatch(appendUserIdsToWorkspace({ toolName, workspaceId, userIds }));
};

export const fetchClockifyUsers = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyUsersFetch.request());
  try {
    const users = await apiFetchClockifyUsersInWorkspace(workspaceId);
    dispatch(
      appendUserIdsToWorkspaceForTool(ToolName.Clockify, users, workspaceId),
    );

    return dispatch(clockifyUsersFetch.success(users));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUsersFetch.failure());
  }
};

const appendTogglUserGroupIdsToUsers = async (
  workspaceId: string,
  users: TogglUser[],
) => {
  const workspaceUsers = await apiFetchTogglWorkspaceUsers(workspaceId);
  const workspaceUsersById = workspaceUsers.reduce(
    (acc, workspaceUserRecord) => ({
      ...acc,
      [workspaceUserRecord.uid.toString()]: workspaceUserRecord,
    }),
    {},
  );

  users.forEach(user => {
    Object.assign(user, { userGroupIds: [] });
    const workspaceUser = get(workspaceUsersById, user.id.toString());
    if (!workspaceUser) return;
    if (!workspaceUser.group_ids) return;

    workspaceUser.group_ids.forEach((userGroupId: number) => {
      const validGroupId = userGroupId.toString();
      user.userGroupIds.push(validGroupId);
    });
  });
};

export const fetchTogglUsers = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglUsersFetch.request());
  try {
    const users = await apiFetchTogglUsersInWorkspace(workspaceId);
    dispatch(
      appendUserIdsToWorkspaceForTool(ToolName.Toggl, users, workspaceId),
    );

    await appendTogglUserGroupIdsToUsers(workspaceId, users);

    return dispatch(togglUsersFetch.success(users));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglUsersFetch.failure());
  }
};

export const inviteUsersToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const userEmailsToInvite = selectUsersInvitePayloadForWorkspace(state)(
    togglWorkspaceId,
  );
  if (userEmailsToInvite.length === 0) return Promise.resolve();

  dispatch(clockifyUsersTransfer.request());

  for (const userEmail of userEmailsToInvite) {
    dispatch(
      updateInTransferEntity({ email: userEmail, type: EntityType.User }),
    );
  }

  try {
    await apiAddClockifyUsersToWorkspace(clockifyWorkspaceId, {
      emails: userEmailsToInvite,
    });
    await dispatch(fetchClockifyUsers(clockifyWorkspaceId));

    return dispatch(clockifyUsersTransfer.success());
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUsersTransfer.failure());
  }
};
