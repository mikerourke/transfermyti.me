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
  updateTransferDetails,
} from '~/redux/app/appActions';
import { selectUsersInvitePayloadForWorkspace } from './usersSelectors';
import { appendUserIdsToWorkspace } from '~/redux/entities/workspaces/workspacesActions';
import {
  ClockifyUserModel,
  ReduxDispatch,
  ReduxGetState,
  TogglUserModel,
  ToolName,
} from '~/types';

export const clockifyUsersFetch = createAsyncAction(
  '@users/CLOCKIFY_FETCH_REQUEST',
  '@users/CLOCKIFY_FETCH_SUCCESS',
  '@users/CLOCKIFY_FETCH_FAILURE',
)<void, Array<ClockifyUserModel>, void>();

export const togglUsersFetch = createAsyncAction(
  '@users/TOGGL_FETCH_REQUEST',
  '@users/TOGGL_FETCH_SUCCESS',
  '@users/TOGGL_FETCH_FAILURE',
)<void, Array<TogglUserModel>, void>();

export const clockifyUsersTransfer = createAsyncAction(
  '@users/CLOCKIFY_TRANSFER_REQUEST',
  '@users/CLOCKIFY_TRANSFER_SUCCESS',
  '@users/CLOCKIFY_TRANSFER_FAILURE',
)<void, void, void>();

export const flipIsUserIncluded = createStandardAction(
  '@users/FLIP_IS_INCLUDED',
)<string>();

export const fetchClockifyUsers = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyUsersFetch.request());
  try {
    const users = await apiFetchClockifyUsersInWorkspace(workspaceId);
    const userIds = users.map(({ id }) => id.toString());

    dispatch(
      appendUserIdsToWorkspace({
        toolName: ToolName.Clockify,
        workspaceId,
        userIds,
      }),
    );

    return dispatch(clockifyUsersFetch.success(users));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUsersFetch.failure());
  }
};

export const fetchTogglUsers = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglUsersFetch.request());
  try {
    const users = await apiFetchTogglUsersInWorkspace(workspaceId);
    const userIds = users.map(({ id }) => id.toString());

    dispatch(
      appendUserIdsToWorkspace({
        toolName: ToolName.Toggl,
        workspaceId,
        userIds,
      }),
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
  const countOfUserEmails = userEmailsToInvite.length;
  if (countOfUserEmails === 0) return Promise.resolve();

  dispatch(clockifyUsersTransfer.request());

  let countCurrent = 1;
  for (const userEmail of userEmailsToInvite) {
    dispatch(
      updateTransferDetails({
        countCurrent,
        countTotal: countOfUserEmails,
        inTransferEntity: { name: userEmail },
      }),
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

async function appendTogglUserGroupIdsToUsers(
  workspaceId: string,
  users: Array<TogglUserModel>,
) {
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
}
