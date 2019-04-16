import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { flatten, isEmpty } from 'lodash';
import { batchClockifyRequests, buildThrottler } from '~/redux/utils';
import {
  apiCreateClockifyTask,
  apiFetchClockifyTasks,
  apiFetchTogglTasks,
} from '~/redux/entities/api/tasks';
import {
  showFetchErrorNotification,
  updateInTransferEntity,
} from '~/redux/app/appActions';
import { selectClockifyProjectIds } from '~/redux/entities/projects/projectsSelectors';
import { selectTasksTransferPayloadForWorkspace } from './tasksSelectors';
import {
  ClockifyTaskModel,
  ReduxDispatch,
  ReduxGetState,
  TogglTaskModel,
} from '~/types';

export const clockifyTasksFetch = createAsyncAction(
  '@tasks/CLOCKIFY_FETCH_REQUEST',
  '@tasks/CLOCKIFY_FETCH_SUCCESS',
  '@tasks/CLOCKIFY_FETCH_FAILURE',
)<void, Array<ClockifyTaskModel>, void>();

export const togglTasksFetch = createAsyncAction(
  '@tasks/TOGGL_FETCH_REQUEST',
  '@tasks/TOGGL_FETCH_SUCCESS',
  '@tasks/TOGGL_FETCH_FAILURE',
)<void, Array<TogglTaskModel>, void>();

export const clockifyTasksTransfer = createAsyncAction(
  '@tasks/CLOCKIFY_TRANSFER_REQUEST',
  '@tasks/CLOCKIFY_TRANSFER_SUCCESS',
  '@tasks/CLOCKIFY_TRANSFER_FAILURE',
)<void, Array<ClockifyTaskModel>, void>();

export const flipIsTaskIncluded = createStandardAction(
  '@tasks/FLIP_IS_INCLUDED',
)<string>();

export const fetchClockifyTasks = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(clockifyTasksFetch.request());

  try {
    const state = getState();
    const projectIds = selectClockifyProjectIds(state);

    const { promiseThrottle, throttledFunc } = buildThrottler(
      4,
      apiFetchClockifyTasks,
    );

    const projectTasks: Array<Array<ClockifyTaskModel>> = [];
    for (const projectId of projectIds) {
      await promiseThrottle
        // @ts-ignore
        .add(throttledFunc.bind(this, workspaceId, projectId))
        .then((tasks: Array<ClockifyTaskModel>) => {
          projectTasks.push(tasks);
        });
    }

    const tasks = flatten(projectTasks);

    return dispatch(clockifyTasksFetch.success(tasks));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTasksFetch.failure());
  }
};

export const fetchTogglTasks = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglTasksFetch.request());

  try {
    const tasks = await apiFetchTogglTasks(workspaceId);
    return dispatch(togglTasksFetch.success(tasks));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTasksFetch.failure());
  }
};

export const transferTasksToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const tasksInWorkspaceByProjectId = selectTasksTransferPayloadForWorkspace(
    state,
  )(togglWorkspaceId);
  if (isEmpty(tasksInWorkspaceByProjectId)) return Promise.resolve();

  dispatch(clockifyTasksTransfer.request());

  try {
    const allWorkspaceTasks: Array<Array<ClockifyTaskModel>> = [];

    for (const [projectId, projectTasks] of Object.entries(
      tasksInWorkspaceByProjectId,
    )) {
      if (projectTasks.length !== 0) {
        const tasks = await batchClockifyRequests(
          4,
          task => dispatch(updateInTransferEntity(task)),
          projectTasks,
          apiCreateClockifyTask,
          clockifyWorkspaceId,
          projectId,
        );
        allWorkspaceTasks.push(tasks);
      }
    }

    const tasks = flatten(allWorkspaceTasks);

    return dispatch(clockifyTasksTransfer.success(tasks));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTasksTransfer.failure());
  }
};
