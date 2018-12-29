import { createAction } from 'redux-actions';
import { apiFetchClockifyTasks, apiFetchTogglTasks } from '../api/tasks';
import { showFetchErrorNotification } from '../../app/appActions';
import { ClockifyTask, TogglTask } from '../../../types/tasksTypes';
import { Dispatch } from '../../rootReducer';

export const clockifyTasksFetchStarted = createAction(
  '@tasks/CLOCKIFY_FETCH_STARTED',
);
export const clockifyTasksFetchSuccess = createAction(
  '@tasks/CLOCKIFY_FETCH_SUCCESS',
  (tasks: ClockifyTask[]) => tasks,
);
export const clockifyTasksFetchFailure = createAction(
  '@tasks/CLOCKIFY_FETCH_FAILURE',
);
export const togglTasksFetchStarted = createAction(
  '@tasks/TOGGL_FETCH_STARTED',
);
export const togglTasksFetchSuccess = createAction(
  '@tasks/TOGGL_FETCH_SUCCESS',
  (tasks: TogglTask[]) => tasks,
);
export const togglTasksFetchFailure = createAction(
  '@tasks/TOGGL_FETCH_FAILURE',
);
export const updateIsTaskIncluded = createAction(
  '@tasks/UPDATE_IS_INCLUDED',
  (taskId: string) => taskId,
);

export const fetchClockifyTasks = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyTasksFetchStarted());
  try {
    const tasks = await apiFetchClockifyTasks(workspaceId);
    return dispatch(clockifyTasksFetchSuccess(tasks));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTasksFetchFailure());
  }
};

export const fetchTogglTasks = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(togglTasksFetchStarted());
  try {
    const tasks = await apiFetchTogglTasks(workspaceId);
    return dispatch(togglTasksFetchSuccess(tasks));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTasksFetchFailure());
  }
};
