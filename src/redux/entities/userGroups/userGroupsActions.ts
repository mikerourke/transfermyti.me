import { createAsyncAction, createStandardAction } from "typesafe-actions";
import { batchClockifyTransferRequests, getValidEntities } from "~/redux/utils";
import {
  apiCreateClockifyUserGroup,
  apiFetchClockifyUserGroups,
  apiFetchTogglUserGroups,
} from "~/redux/entities/api/userGroups";
import { showFetchErrorNotification } from "~/redux/app/appActions";
import {
  selectClockifyUsersByWorkspace,
  selectTogglUsersByWorkspaceFactory,
} from "~/redux/entities/users/usersSelectors";
import { selectUserGroupsTransferPayloadForWorkspace } from "./userGroupsSelectors";
import { UserGroupTransform } from "./UserGroupTransform";
import {
  ClockifyUserGroupModel,
  CompoundTimeEntryModel,
  CompoundUserGroupModel,
  CompoundUserModel,
  EntitiesFetchPayloadModel,
  EntityGroup,
  ReduxDispatch,
  ReduxGetState,
  TogglUserGroupModel,
  ToolName,
} from "~/types";

export interface EntryCountCalculatorModel {
  toolName: ToolName;
  timeEntries: Array<CompoundTimeEntryModel>;
  usersById: Record<string, CompoundUserModel>;
}

export const clockifyUserGroupsFetch = createAsyncAction(
  "@userGroups/CLOCKIFY_FETCH_REQUEST",
  "@userGroups/CLOCKIFY_FETCH_SUCCESS",
  "@userGroups/CLOCKIFY_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyUserGroupModel>, void>();

export const togglUserGroupsFetch = createAsyncAction(
  "@userGroups/TOGGL_FETCH_REQUEST",
  "@userGroups/TOGGL_FETCH_SUCCESS",
  "@userGroups/TOGGL_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<CompoundUserGroupModel>, void>();

export const clockifyUserGroupsTransfer = createAsyncAction(
  "@userGroups/CLOCKIFY_TRANSFER_REQUEST",
  "@userGroups/CLOCKIFY_TRANSFER_SUCCESS",
  "@userGroups/CLOCKIFY_TRANSFER_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyUserGroupModel>, void>();

export const flipIsUserGroupIncluded = createStandardAction(
  "@userGroups/FLIP_IS_INCLUDED",
)<string>();

export const addTogglUserIdToGroup = createStandardAction(
  "@userGroups/ADD_TOGGL_USER_ID_TO_GROUP",
)<{ userId: string; userGroupId: string }>();

export const calculateUserGroupEntryCounts = createStandardAction(
  "@userGroups/CALCULATE_ENTRY_COUNTS",
)<EntryCountCalculatorModel>();

export const fetchClockifyUserGroups = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(clockifyUserGroupsFetch.request());

  try {
    const clockifyUserGroups = await apiFetchClockifyUserGroups(workspaceId);

    const state = getState();
    const usersByWorkspace = selectClockifyUsersByWorkspace(state);
    const userGroups = convertToCompoundUserGroups({
      workspaceId,
      userGroups: clockifyUserGroups,
      usersByWorkspace,
    });

    return dispatch(
      clockifyUserGroupsFetch.success({
        entityRecords: userGroups,
        workspaceId,
      }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    return dispatch(clockifyUserGroupsFetch.failure());
  }
};

export const fetchTogglUserGroups = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(togglUserGroupsFetch.request());

  try {
    const togglUserGroups = await apiFetchTogglUserGroups(workspaceId);

    const state = getState();
    const usersByWorkspace = selectTogglUsersByWorkspaceFactory(false)(state);

    const userGroups = convertToCompoundUserGroups({
      workspaceId,
      userGroups: togglUserGroups,
      usersByWorkspace,
    });

    return dispatch(
      togglUserGroupsFetch.success({ entityRecords: userGroups, workspaceId }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    return dispatch(togglUserGroupsFetch.failure());
  }
};

export const transferUserGroupsToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const userGroupsInWorkspace = selectUserGroupsTransferPayloadForWorkspace(
    state,
  )(togglWorkspaceId);
  if (userGroupsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyUserGroupsTransfer.request());

  try {
    const userGroups = await batchClockifyTransferRequests({
      requestsPerSecond: 4,
      dispatch,
      entityGroup: EntityGroup.UserGroups,
      entityRecordsInWorkspace: userGroupsInWorkspace,
      apiFunc: apiCreateClockifyUserGroup,
      clockifyWorkspaceId,
      togglWorkspaceId,
    });

    return dispatch(
      clockifyUserGroupsTransfer.success({
        entityRecords: userGroups,
        workspaceId: clockifyWorkspaceId,
      }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    return dispatch(clockifyUserGroupsTransfer.failure());
  }
};

function convertToCompoundUserGroups({
  workspaceId,
  userGroups,
  usersByWorkspace,
}: {
  workspaceId: string;
  userGroups: Array<TogglUserGroupModel | ClockifyUserGroupModel>;
  usersByWorkspace: Record<string, Array<CompoundUserModel>>;
}): Array<CompoundUserGroupModel> {
  if (getValidEntities(userGroups).length === 0) return [];

  return userGroups.map(userGroup => {
    const transform = new UserGroupTransform(userGroup);
    return transform.compound(workspaceId, usersByWorkspace);
  });
}
