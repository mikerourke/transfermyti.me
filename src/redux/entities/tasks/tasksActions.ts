import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { flatten } from 'lodash';
import { batchClockifyTransferRequests, buildThrottler } from '~/redux/utils';
import {
  apiCreateClockifyTask,
  apiFetchClockifyTasks,
  apiFetchTogglTasks,
} from '~/redux/entities/api/tasks';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectClockifyProjectIds } from '~/redux/entities/projects/projectsSelectors';
import { selectTasksTransferPayloadForWorkspace } from './tasksSelectors';
import {
  ClockifyTaskModel,
  EntitiesFetchPayloadModel,
  EntityGroup,
  ReduxDispatch,
  ReduxGetState,
  TogglTaskModel,
} from '~/types';

export const clockifyTasksFetch = createAsyncAction(
  '@tasks/CLOCKIFY_FETCH_REQUEST',
  '@tasks/CLOCKIFY_FETCH_SUCCESS',
  '@tasks/CLOCKIFY_FETCH_FAILURE',
)<void, EntitiesFetchPayloadModel<ClockifyTaskModel>, void>();

export const togglTasksFetch = createAsyncAction(
  '@tasks/TOGGL_FETCH_REQUEST',
  '@tasks/TOGGL_FETCH_SUCCESS',
  '@tasks/TOGGL_FETCH_FAILURE',
)<void, EntitiesFetchPayloadModel<TogglTaskModel>, void>();

export const clockifyTasksTransfer = createAsyncAction(
  '@tasks/CLOCKIFY_TRANSFER_REQUEST',
  '@tasks/CLOCKIFY_TRANSFER_SUCCESS',
  '@tasks/CLOCKIFY_TRANSFER_FAILURE',
)<void, EntitiesFetchPayloadModel<ClockifyTaskModel>, void>();

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

    return dispatch(
      clockifyTasksFetch.success({ entityRecords: tasks, workspaceId }),
    );
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
    return dispatch(
      togglTasksFetch.success({ entityRecords: tasks, workspaceId }),
    );
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
  const tasksInWorkspace = selectTasksTransferPayloadForWorkspace(state)(
    togglWorkspaceId,
  );
  if (tasksInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyTasksTransfer.request());

  try {
    const tasks = await batchClockifyTransferRequests({
      requestsPerSecond: 4,
      dispatch,
      entityGroup: EntityGroup.Tasks,
      entityRecordsInWorkspace: tasksInWorkspace,
      apiFunc: apiCreateClockifyTask,
      workspaceId: togglWorkspaceId,
    });

    return dispatch(
      clockifyTasksTransfer.success({
        entityRecords: tasks,
        workspaceId: clockifyWorkspaceId,
      }),
    );
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTasksTransfer.failure());
  }
};
