import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { set } from 'lodash';
import { batchClockifyRequests, buildThrottler } from '~/redux/utils';
import {
  apiCreateClockifyProject,
  apiFetchClockifyProjects,
  apiFetchTogglProjects,
} from '../api/projects';
import {
  apiFetchClockifyUsersInProject,
  apiFetchTogglUsersInProject,
} from '../api/users';
import {
  showFetchErrorNotification,
  updateInTransferEntity,
} from '~/redux/app/appActions';
import { selectProjectsTransferPayloadForWorkspace } from './projectsSelectors';
import { ReduxDispatch, ReduxGetState } from '~/types/commonTypes';
import { EntityType } from '~/types/entityTypes';
import {
  ClockifyProject,
  ProjectModel,
  TogglProject,
  TogglProjectUser,
} from '~/types/projectsTypes';
import { ClockifyUser } from '~/types/usersTypes';

export const clockifyProjectsFetch = createAsyncAction(
  '@projects/CLOCKIFY_FETCH_REQUEST',
  '@projects/CLOCKIFY_FETCH_SUCCESS',
  '@projects/CLOCKIFY_FETCH_FAILURE',
)<void, Array<ClockifyProject>, void>();

export const togglProjectsFetch = createAsyncAction(
  '@projects/TOGGL_FETCH_REQUEST',
  '@projects/TOGGL_FETCH_SUCCESS',
  '@projects/TOGGL_FETCH_FAILURE',
)<void, Array<TogglProject>, void>();

export const clockifyProjectsTransfer = createAsyncAction(
  '@projects/CLOCKIFY_TRANSFER_REQUEST',
  '@projects/CLOCKIFY_TRANSFER_SUCCESS',
  '@projects/CLOCKIFY_TRANSFER_FAILURE',
)<void, Array<ClockifyProject>, void>();

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
  if (projectsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyProjectsTransfer.request());

  const onProject = (project: ProjectModel) => {
    const transferRecord = { ...project, type: EntityType.Project };
    dispatch(updateInTransferEntity(transferRecord));
  };

  try {
    const projects = await batchClockifyRequests(
      onProject,
      projectsInWorkspace,
      apiCreateClockifyProject,
      clockifyWorkspaceId,
    );

    return dispatch(clockifyProjectsTransfer.success(projects));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyProjectsTransfer.failure());
  }
};

async function appendUserIdsToProject(
  projects: Array<TogglProject | ClockifyProject>,
  apiFetchUsersFunc: (projectId: string, workspaceId?: string) => Promise<any>,
  workspaceId?: string,
): Promise<void> {
  const { promiseThrottle, throttledFunc } = buildThrottler(apiFetchUsersFunc);

  for (const project of projects) {
    try {
      await promiseThrottle
        .add(
          // @ts-ignore
          throttledFunc.bind(this, project.id.toString(), workspaceId),
        )
        .then((projectUsers: Array<ClockifyUser | TogglProjectUser>) => {
          const userIds = projectUsers.map(projectUser =>
            'uid' in projectUser ? projectUser.uid : projectUser.id,
          );
          set(project, 'userIds', userIds);
        });
    } catch (error) {
      if (error.status !== 403) throw error;
    }
  }
}
