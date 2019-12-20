import { createAsyncAction, createAction } from "typesafe-actions";
import { get } from "lodash";
import {
  showFetchErrorNotification,
  updateInTransferDetails,
} from "~/app/appActions";
import { appendUserIdsToWorkspace } from "~/workspaces/workspacesActions";
import {
  apiAddClockifyUsersToWorkspace,
  apiFetchClockifyUsersInWorkspace,
  apiFetchTogglUsersInWorkspace,
  apiFetchTogglWorkspaceUsers,
} from "./usersApi";
import { selectUsersInvitePayloadForWorkspace } from "./usersSelectors";
import {
  EntitiesFetchPayloadModel,
  EntityGroup,
  ToolName,
} from "~/common/commonTypes";
import { ReduxDispatch, ReduxGetState } from "~/redux/reduxTypes";
import { ClockifyUserModel, TogglUserModel } from "./usersTypes";

export const clockifyUsersFetch = createAsyncAction(
  "@users/CLOCKIFY_FETCH_REQUEST",
  "@users/CLOCKIFY_FETCH_SUCCESS",
  "@users/CLOCKIFY_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyUserModel>, void>();

export const togglUsersFetch = createAsyncAction(
  "@users/TOGGL_FETCH_REQUEST",
  "@users/TOGGL_FETCH_SUCCESS",
  "@users/TOGGL_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<TogglUserModel>, void>();

export const clockifyUsersTransfer = createAsyncAction(
  "@users/CLOCKIFY_TRANSFER_REQUEST",
  "@users/CLOCKIFY_TRANSFER_SUCCESS",
  "@users/CLOCKIFY_TRANSFER_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyUserModel>, void>();

export const flipIsUserIncluded = createAction("@users/FLIP_IS_INCLUDED")<
  string
>();

export const fetchClockifyUsers = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyUsersFetch.request());
  try {
    const users = await fetchClockifyUsersAndAppendUserIds(
      dispatch,
      workspaceId,
    );

    dispatch(clockifyUsersFetch.success({ entityRecords: users, workspaceId }));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyUsersFetch.failure());
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

    dispatch(togglUsersFetch.success({ entityRecords: users, workspaceId }));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(togglUsersFetch.failure());
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
  if (countOfUserEmails === 0) {
    return;
  }

  dispatch(clockifyUsersTransfer.request());

  try {
    await apiAddClockifyUsersToWorkspace(clockifyWorkspaceId, {
      emails: userEmailsToInvite,
    });

    const users = await fetchClockifyUsersAndAppendUserIds(
      dispatch,
      clockifyWorkspaceId,
    );

    userEmailsToInvite.forEach((userEmail, emailIndex) => {
      dispatch(
        updateInTransferDetails({
          countTotalInGroup: userEmailsToInvite.length,
          countCurrentInGroup: emailIndex,
          entityGroup: EntityGroup.Users,
          workspaceId: togglWorkspaceId,
        }),
      );
    });

    dispatch(
      clockifyUsersTransfer.success({
        entityRecords: users,
        workspaceId: clockifyWorkspaceId,
      }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyUsersTransfer.failure());
  }
};

async function fetchClockifyUsersAndAppendUserIds(
  dispatch: ReduxDispatch,
  workspaceId: string,
): Promise<Array<ClockifyUserModel>> {
  const users = await apiFetchClockifyUsersInWorkspace(workspaceId);
  const userIds = users.map(({ id }) => id.toString());

  dispatch(
    appendUserIdsToWorkspace({
      toolName: ToolName.Clockify,
      workspaceId,
      userIds,
    }),
  );

  return users;
}

async function appendTogglUserGroupIdsToUsers(
  workspaceId: string,
  users: Array<TogglUserModel>,
): Promise<void> {
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
    if (!workspaceUser) {
      return;
    }
    if (!workspaceUser.group_ids) {
      return;
    }

    workspaceUser.group_ids.forEach((userGroupId: number) => {
      const validGroupId = userGroupId.toString();
      user.userGroupIds.push(validGroupId);
    });
  });
}
