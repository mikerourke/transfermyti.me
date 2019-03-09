import { createAction } from 'redux-actions';
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
export const clockifyTasksTransferStarted = createAction(
  '@tasks/CLOCKIFY_TRANSFER_STARTED',
);
export const clockifyTasksTransferSuccess = createAction(
  '@tasks/CLOCKIFY_TRANSFER_SUCCESS',
  (tasks: ClockifyTask[]) => tasks,
);
export const clockifyTasksTransferFailure = createAction(
  '@tasks/CLOCKIFY_TRANSFER_FAILURE',
);
export const updateIsTaskIncluded = createAction(
  '@tasks/UPDATE_IS_INCLUDED',
  (taskId: string) => taskId,
);

const fetchClockifyTasksForProjectsInWorkspace = async (
  workspaceId: string,
  projectIds: string[],
): Promise<TogglTask[]> => {
  const { promiseThrottle, throttledFn } = buildThrottler(
    apiFetchClockifyTasks,
  );

  const projectTasks: TogglTask[][] = [];
  for (const projectId of projectIds) {
    await promiseThrottle
      // @ts-ignore
      .add(throttledFn.bind(this, workspaceId, projectId))
      .then((tasks: TogglTask[]) => {
        projectTasks.push(tasks);
      });
  }

  return flatten(projectTasks);
};

export const fetchClockifyTasks = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(clockifyTasksFetchStarted());
  try {
    const state = getState();
    const projectIds = selectClockifyProjectIds(state);
    const tasks = await fetchClockifyTasksForProjectsInWorkspace(
      workspaceId,
      projectIds,
    );
    return dispatch(clockifyTasksFetchSuccess(tasks));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTasksFetchFailure());
  }
};

export const fetchTogglTasks = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
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

  dispatch(clockifyTasksTransferStarted());
  try {
    const tasks = await transferClockifyTasksForProjectsInWorkspace(
      clockifyWorkspaceId,
      tasksInWorkspaceByProjectId,
    );
    return dispatch(clockifyTasksTransferSuccess(tasks));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTasksTransferFailure());
  }
};
