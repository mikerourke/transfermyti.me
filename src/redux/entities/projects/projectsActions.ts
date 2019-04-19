import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { set } from 'lodash';
import { batchClockifyRequests, buildThrottler } from '~/redux/utils';
import {
  apiCreateClockifyProject,
  apiFetchClockifyProjects,
  apiFetchTogglProjects,
} from '~/redux/entities/api/projects';
import {
  apiFetchClockifyUsersInProject,
  apiFetchTogglUsersInProject,
} from '~/redux/entities/api/users';
import {
  showFetchErrorNotification,
  updateInTransferDetails,
} from '~/redux/app/appActions';
import { selectProjectsTransferPayloadForWorkspace } from './projectsSelectors';
import {
  ClockifyProjectModel,
  ClockifyUserModel,
  EntityGroup,
  EntityWithName,
  ReduxDispatch,
  ReduxGetState,
  TogglProjectModel,
  TogglProjectUserModel,
} from '~/types';

export const clockifyProjectsFetch = createAsyncAction(
  '@projects/CLOCKIFY_FETCH_REQUEST',
  '@projects/CLOCKIFY_FETCH_SUCCESS',
  '@projects/CLOCKIFY_FETCH_FAILURE',
)<void, Array<ClockifyProjectModel>, void>();

export const togglProjectsFetch = createAsyncAction(
  '@projects/TOGGL_FETCH_REQUEST',
  '@projects/TOGGL_FETCH_SUCCESS',
  '@projects/TOGGL_FETCH_FAILURE',
)<void, Array<TogglProjectModel>, void>();

export const clockifyProjectsTransfer = createAsyncAction(
  '@projects/CLOCKIFY_TRANSFER_REQUEST',
  '@projects/CLOCKIFY_TRANSFER_SUCCESS',
  '@projects/CLOCKIFY_TRANSFER_FAILURE',
)<void, Array<ClockifyProjectModel>, void>();

export const flipIsProjectIncluded = createStandardAction(
  '@projects/FLIP_IS_INCLUDED',
)<string>();

export const fetchClockifyProjects = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyProjectsFetch.request());
  try {
    const { project: projects } = await apiFetchClockifyProjects(workspaceId);
    await appendUserIdsToProject(
      projects,
      apiFetchClockifyUsersInProject,
      workspaceId,
    );

    return dispatch(clockifyProjectsFetch.success(projects));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyProjectsFetch.failure());
  }
};

export const fetchTogglProjects = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglProjectsFetch.request());
  try {
    const projects = await apiFetchTogglProjects(workspaceId);
    await appendUserIdsToProject(projects, apiFetchTogglUsersInProject);

    return dispatch(togglProjectsFetch.success(projects));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglProjectsFetch.failure());
  }
};

export const transferProjectsToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const projectsInWorkspace = selectProjectsTransferPayloadForWorkspace(state)(
    togglWorkspaceId,
  );
  const countOfProjects = projectsInWorkspace.length;
  if (countOfProjects === 0) return;

  dispatch(clockifyProjectsTransfer.request());

  const onProject = (recordNumber: number, entityRecord: EntityWithName) => {
    dispatch(
      updateInTransferDetails({
        countTotal: countOfProjects,
        countCurrent: recordNumber,
        entityGroup: EntityGroup.Projects,
        workspaceId: togglWorkspaceId,
        entityRecord,
      }),
    );
  };

  try {
    const projects = await batchClockifyRequests(
      4,
      onProject,
      projectsInWorkspace,
      apiCreateClockifyProject,
      clockifyWorkspaceId,
    );

    dispatch(clockifyProjectsTransfer.success(projects));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    dispatch(clockifyProjectsTransfer.failure());
  }
};

async function appendUserIdsToProject(
  projects: Array<TogglProjectModel | ClockifyProjectModel>,
  apiFetchUsersFunc: (projectId: string, workspaceId?: string) => Promise<any>,
  workspaceId?: string,
): Promise<void> {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    4,
    apiFetchUsersFunc,
  );

  for (const project of projects) {
    try {
      await promiseThrottle
        .add(
          // @ts-ignore
          throttledFunc.bind(this, project.id.toString(), workspaceId),
        )
        .then(
          (projectUsers: Array<ClockifyUserModel | TogglProjectUserModel>) => {
            const userIds = projectUsers.map(projectUser =>
              'uid' in projectUser ? projectUser.uid : projectUser.id,
            );
            set(project, 'userIds', userIds);
          },
        );
    } catch (error) {
      if (error.status !== 403) throw error;
    }
  }
}
