import { createAction } from 'redux-actions';
import { apiFetchClockifyTags, apiFetchTogglTags } from '../api/tags';
import { showFetchErrorNotification } from '../../app/appActions';
import { ClockifyTag, TogglTag } from '../../../types/tagsTypes';
import { Dispatch } from '../../rootReducer';

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
