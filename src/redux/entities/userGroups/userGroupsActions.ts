import { createAction } from 'redux-actions';
import { batchClockifyRequests } from '~/redux/utils';
import {
  apiCreateClockifyUserGroup,
  apiFetchClockifyUserGroups,
  apiFetchTogglUserGroups,
} from '~/redux/entities/api/userGroups';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectUserGroupsTransferPayloadForWorkspace } from './userGroupsSelectors';
import { ReduxDispatch, ReduxGetState } from '~/types/commonTypes';
import { ClockifyUserGroup, TogglUserGroup } from '~/types/userGroupsTypes';

export const clockifyUserGroupsFetchStarted = createAction(
  '@userGroups/CLOCKIFY_FETCH_STARTED',
);
export const clockifyUserGroupsFetchSuccess = createAction(
  '@userGroups/CLOCKIFY_FETCH_SUCCESS',
  (userGroups: ClockifyUserGroup[]) => userGroups,
);
export const clockifyUserGroupsFetchFailure = createAction(
  '@userGroups/CLOCKIFY_FETCH_FAILURE',
);
export const togglUserGroupsFetchStarted = createAction(
  '@userGroups/TOGGL_FETCH_STARTED',
);
export const togglUserGroupsFetchSuccess = createAction(
  '@userGroups/TOGGL_FETCH_SUCCESS',
  (userGroups: TogglUserGroup[]) => userGroups,
);
export const togglUserGroupsFetchFailure = createAction(
  '@userGroups/TOGGL_FETCH_FAILURE',
);
export const clockifyUserGroupsTransferStarted = createAction(
  '@userGroups/CLOCKIFY_TRANSFER_STARTED',
);
export const clockifyUserGroupsTransferSuccess = createAction(
  '@userGroups/CLOCKIFY_TRANSFER_SUCCESS',
  (userGroups: ClockifyUserGroup[]) => userGroups,
);
export const clockifyUserGroupsTransferFailure = createAction(
  '@userGroups/CLOCKIFY_TRANSFER_FAILURE',
);
export const updateIsUserGroupIncluded = createAction(
  '@userGroups/UPDATE_IS_INCLUDED',
  (userGroupId: string) => userGroupId,
);

export const fetchClockifyUserGroups = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyUserGroupsFetchStarted());
  try {
    const userGroups = await apiFetchClockifyUserGroups(workspaceId);
    return dispatch(clockifyUserGroupsFetchSuccess(userGroups));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUserGroupsFetchFailure());
  }
};

export const fetchTogglUserGroups = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglUserGroupsFetchStarted());
  try {
    const userGroups = await apiFetchTogglUserGroups(workspaceId);
    return dispatch(togglUserGroupsFetchSuccess(userGroups));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglUserGroupsFetchFailure());
  }
};

export const transferUserGroupsToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const userGroupsInWorkspace = selectUserGroupsTransferPayloadForWorkspace(
    state,
    togglWorkspaceId,
  );
  if (userGroupsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyUserGroupsTransferStarted());
  try {
    const userGroups = await batchClockifyRequests(
      userGroupsInWorkspace,
      apiCreateClockifyUserGroup,
      clockifyWorkspaceId,
    );
    return dispatch(clockifyUserGroupsTransferSuccess(userGroups));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyUserGroupsTransferFailure());
  }
};
