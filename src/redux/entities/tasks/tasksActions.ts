import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { flatten, isEmpty } from 'lodash';
import { batchClockifyRequests, buildThrottler } from '~/redux/utils';
import {
  apiCreateClockifyTask,
  apiFetchClockifyTasks,
  apiFetchTogglTasks,
} from '~/redux/entities/api/tasks';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectClockifyProjectIds } from '~/redux/entities/projects/projectsSelectors';
import { selectTasksTransferPayloadForWorkspace } from './tasksSelectors';
import { ReduxDispatch, ReduxGetState } from '~/types/commonTypes';
import { ClockifyTask, CreateTaskRequest, TogglTask } from '~/types/tasksTypes';

export const clockifyTasksFetch = createAsyncAction(
  '@tasks/CLOCKIFY_FETCH_REQUEST',
  '@tasks/CLOCKIFY_FETCH_SUCCESS',
  '@tasks/CLOCKIFY_FETCH_FAILURE',
)<void, ClockifyTask[], void>();

export const togglTasksFetch = createAsyncAction(
  '@tasks/TOGGL_FETCH_REQUEST',
  '@tasks/TOGGL_FETCH_SUCCESS',
  '@tasks/TOGGL_FETCH_FAILURE',
)<void, TogglTask[], void>();

export const clockifyTasksTransfer = createAsyncAction(
  '@tasks/CLOCKIFY_TRANSFER_REQUEST',
  '@tasks/CLOCKIFY_TRANSFER_SUCCESS',
  '@tasks/CLOCKIFY_TRANSFER_FAILURE',
)<void, ClockifyTask[], void>();

export const updateIsTaskIncluded = createStandardAction(
  '@tasks/UPDATE_IS_INCLUDED',
)<string>();

const fetchClockifyTasksForProjectsInWorkspace = async (
  workspaceId: string,
  projectIds: string[],
): Promise<ClockifyTask[]> => {
  const { promiseThrottle, throttledFn } = buildThrottler(
    apiFetchClockifyTasks,
  );

  const projectTasks: ClockifyTask[][] = [];
  for (const projectId of projectIds) {
    await promiseThrottle
      // @ts-ignore
      .add(throttledFn.bind(this, workspaceId, projectId))
      .then((tasks: ClockifyTask[]) => {
        projectTasks.push(tasks);
      });
  }

  return flatten(projectTasks);
};

export const fetchClockifyTasks = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(clockifyTasksFetch.request());
  try {
    const state = getState();
    const projectIds = selectClockifyProjectIds(state);
    const tasks = await fetchClockifyTasksForProjectsInWorkspace(
      workspaceId,
      projectIds,
    );
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

const transferClockifyTasksForProjectsInWorkspace = async (
  workspaceId: string,
  tasksInWorkspaceByProjectId: Record<string, CreateTaskRequest[]>,
): Promise<ClockifyTask[]> => {
  const allProjectTasks: ClockifyTask[][] = [];

  for (const [projectId, taskRecords] of Object.entries(
    tasksInWorkspaceByProjectId,
  )) {
    if (taskRecords.length > 0) {
      const tasks = await batchClockifyRequests(
        taskRecords,
        apiCreateClockifyTask,
        workspaceId,
        projectId,
      );
      allProjectTasks.push(tasks);
    }
  }

  return flatten(allProjectTasks);
};

export const transferTasksToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const tasksInWorkspaceByProjectId = selectTasksTransferPayloadForWorkspace(
    state,
    togglWorkspaceId,
  );
  if (isEmpty(tasksInWorkspaceByProjectId)) return Promise.resolve();

  dispatch(clockifyTasksTransfer.request());
  try {
    const tasks = await transferClockifyTasksForProjectsInWorkspace(
      clockifyWorkspaceId,
      tasksInWorkspaceByProjectId,
    );
    return dispatch(clockifyTasksTransfer.success(tasks));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTasksTransfer.failure());
  }
};
