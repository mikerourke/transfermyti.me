import { createAsyncAction, createAction } from "typesafe-actions";
import { batchClockifyTransferRequests, getValidEntities } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  selectClockifyUsersByWorkspace,
  selectTogglUsersByWorkspaceFactory,
} from "~/users/usersSelectors";
import {
  apiCreateClockifyUserGroup,
  apiFetchClockifyUserGroups,
  apiFetchTogglUserGroups,
} from "./userGroupsApi";
import { selectUserGroupsTransferPayloadForWorkspace } from "./userGroupsSelectors";
import { UserGroupTransform } from "./UserGroupTransform";
import {
  EntitiesFetchPayloadModel,
  EntityGroup,
  ToolName,
} from "~/common/commonTypes";
import { ReduxDispatch, ReduxGetState } from "~/redux/reduxTypes";
import { CompoundTimeEntryModel } from "~/timeEntries/timeEntriesTypes";
import { CompoundUserModel } from "~/users/usersTypes";
import {
  ClockifyUserGroupModel,
  CompoundUserGroupModel,
  TogglUserGroupModel,
} from "./userGroupsTypes";

export interface EntryCountCalculatorModel {
  toolName: ToolName;
  timeEntries: CompoundTimeEntryModel[];
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

export const flipIsUserGroupIncluded = createAction(
  "@userGroups/FLIP_IS_INCLUDED",
)<string>();

export const addTogglUserIdToGroup = createAction(
  "@userGroups/ADD_TOGGL_USER_ID_TO_GROUP",
)<{ userId: string; userGroupId: string }>();

export const calculateUserGroupEntryCounts = createAction(
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

    dispatch(
      clockifyUserGroupsFetch.success({
        entityRecords: userGroups,
        workspaceId,
      }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyUserGroupsFetch.failure());
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

    dispatch(
      togglUserGroupsFetch.success({ entityRecords: userGroups, workspaceId }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(togglUserGroupsFetch.failure());
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
  if (userGroupsInWorkspace.length === 0) {
    return;
  }

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

    dispatch(
      clockifyUserGroupsTransfer.success({
        entityRecords: userGroups,
        workspaceId: clockifyWorkspaceId,
      }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyUserGroupsTransfer.failure());
  }
};

function convertToCompoundUserGroups({
  workspaceId,
  userGroups,
  usersByWorkspace,
}: {
  workspaceId: string;
  userGroups: (TogglUserGroupModel | ClockifyUserGroupModel)[];
  usersByWorkspace: Record<string, CompoundUserModel[]>;
}): CompoundUserGroupModel[] {
  if (getValidEntities(userGroups).length === 0) {
    return [];
  }

  return userGroups.map(userGroup => {
    const transform = new UserGroupTransform(userGroup);
    return transform.compound(workspaceId, usersByWorkspace);
  });
}
