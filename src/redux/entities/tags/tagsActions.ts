import { createAction } from 'redux-actions';
import { batchClockifyRequests } from '../../utils';
import {
  apiCreateClockifyTag,
  apiFetchClockifyTags,
  apiFetchTogglTags,
} from '../api/tags';
import { showFetchErrorNotification } from '../../app/appActions';
import { selectTagsTransferPayloadForWorkspace } from './tagsSelectors';
import { ClockifyTag, TogglTag } from '../../../types/tagsTypes';
import { Dispatch, GetState } from '../../rootReducer';

export const clockifyTagsFetchStarted = createAction(
  '@tags/CLOCKIFY_FETCH_STARTED',
);
export const clockifyTagsFetchSuccess = createAction(
  '@tags/CLOCKIFY_FETCH_SUCCESS',
  (tags: ClockifyTag[]) => tags,
);
export const clockifyTagsFetchFailure = createAction(
  '@tags/CLOCKIFY_FETCH_FAILURE',
);
export const togglTagsFetchStarted = createAction('@tags/TOGGL_FETCH_STARTED');
export const togglTagsFetchSuccess = createAction(
  '@tags/TOGGL_FETCH_SUCCESS',
  (tags: TogglTag[]) => tags,
);
export const togglTagsFetchFailure = createAction('@tags/TOGGL_FETCH_FAILURE');
export const clockifyTagsTransferStarted = createAction(
  '@tags/CLOCKIFY_TRANSFER_STARTED',
);
export const clockifyTagsTransferSuccess = createAction(
  '@tags/CLOCKIFY_TRANSFER_SUCCESS',
  (tags: ClockifyTag[]) => tags,
);
export const clockifyTagsTransferFailure = createAction(
  '@tags/CLOCKIFY_TRANSFER_FAILURE',
);
export const updateIsTagIncluded = createAction(
  '@tags/UPDATE_IS_INCLUDED',
  (tagId: string) => tagId,
);

export const fetchClockifyTags = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyTagsFetchStarted());
  try {
    const tags = await apiFetchClockifyTags(workspaceId);
    return dispatch(clockifyTagsFetchSuccess(tags));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTagsFetchFailure());
  }
};

export const fetchTogglTags = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(togglTagsFetchStarted());
  try {
    const tags = await apiFetchTogglTags(workspaceId);
    return dispatch(togglTagsFetchSuccess(tags));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTagsFetchFailure());
  }
};

export const transferTagsToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (
  dispatch: Dispatch<any>,
  getState: GetState,
) => {
  const state = getState();
  const tagRecordsInWorkspace = selectTagsTransferPayloadForWorkspace(
    state,
    togglWorkspaceId,
  );
  if (tagRecordsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyTagsTransferStarted());
  try {
    const tags = await batchClockifyRequests(
      tagRecordsInWorkspace,
      apiCreateClockifyTag,
      clockifyWorkspaceId,
    );
    return dispatch(clockifyTagsTransferSuccess(tags));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTagsTransferFailure());
  }
};
