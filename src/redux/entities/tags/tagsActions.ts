import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { batchClockifyRequests } from '~/redux/utils';
import {
  apiCreateClockifyTag,
  apiFetchClockifyTags,
  apiFetchTogglTags,
} from '../api/tags';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectTagsTransferPayloadForWorkspace } from './tagsSelectors';
import { ClockifyTag, TogglTag } from '~/types/tagsTypes';
import { ReduxDispatch, ReduxGetState } from '~/types/commonTypes';

export const clockifyTagsFetch = createAsyncAction(
  '@tags/CLOCKIFY_FETCH_REQUEST',
  '@tags/CLOCKIFY_FETCH_SUCCESS',
  '@tags/CLOCKIFY_FETCH_FAILURE',
)<void, ClockifyTag[], void>();

export const togglTagsFetch = createAsyncAction(
  '@tags/TOGGL_FETCH_REQUEST',
  '@tags/TOGGL_FETCH_SUCCESS',
  '@tags/TOGGL_FETCH_FAILURE',
)<void, TogglTag[], void>();

export const clockifyTagsTransfer = createAsyncAction(
  '@tags/CLOCKIFY_TRANSFER_REQUEST',
  '@tags/CLOCKIFY_TRANSFER_SUCCESS',
  '@tags/CLOCKIFY_TRANSFER_FAILURE',
)<void, ClockifyTag[], void>();

export const updateIsTagIncluded = createStandardAction(
  '@tags/UPDATE_IS_INCLUDED',
)<string>();

export const fetchClockifyTags = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyTagsFetch.request());
  try {
    const tags = await apiFetchClockifyTags(workspaceId);
    return dispatch(clockifyTagsFetch.success(tags));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTagsFetch.failure());
  }
};

export const fetchTogglTags = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglTagsFetch.request());
  try {
    const tags = await apiFetchTogglTags(workspaceId);
    return dispatch(togglTagsFetch.success(tags));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTagsFetch.failure());
  }
};

export const transferTagsToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const tagRecordsInWorkspace = selectTagsTransferPayloadForWorkspace(
    state,
    togglWorkspaceId,
  );
  if (tagRecordsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyTagsTransfer.request());
  try {
    const tags = await batchClockifyRequests(
      tagRecordsInWorkspace,
      apiCreateClockifyTag,
      clockifyWorkspaceId,
    );
    return dispatch(clockifyTagsTransfer.success(tags));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTagsTransfer.failure());
  }
};
