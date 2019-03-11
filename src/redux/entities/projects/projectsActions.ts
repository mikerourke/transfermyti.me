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
import { EntityType, ReduxDispatch, ReduxGetState } from '~/types/commonTypes';
import {
  ClockifyProject,
  TogglProject,
  TogglProjectUser,
} from '~/types/projectsTypes';
import { ClockifyUser } from '~/types/usersTypes';

export const clockifyProjectsFetch = createAsyncAction(
  '@projects/CLOCKIFY_FETCH_REQUEST',
  '@projects/CLOCKIFY_FETCH_SUCCESS',
  '@projects/CLOCKIFY_FETCH_FAILURE',
)<void, ClockifyProject[], void>();

export const togglProjectsFetch = createAsyncAction(
  '@projects/TOGGL_FETCH_REQUEST',
  '@projects/TOGGL_FETCH_SUCCESS',
  '@projects/TOGGL_FETCH_FAILURE',
)<void, TogglProject[], void>();

export const clockifyProjectsTransfer = createAsyncAction(
  '@projects/CLOCKIFY_TRANSFER_REQUEST',
  '@projects/CLOCKIFY_TRANSFER_SUCCESS',
  '@projects/CLOCKIFY_TRANSFER_FAILURE',
)<void, ClockifyProject[], void>();

export const updateIsProjectIncluded = createStandardAction(
  '@projects/UPDATE_IS_INCLUDED',
)<string>();

const appendUserIdsToProject = async (
  projects: (TogglProject | ClockifyProject)[],
  apiFetchUsersFn: (projectId: string, workspaceId?: string) => Promise<any>,
  workspaceId?: string,
): Promise<void> => {
  const { promiseThrottle, throttledFn } = buildThrottler(apiFetchUsersFn);

  for (const project of projects) {
    try {
      await promiseThrottle
        .add(
          // @ts-ignore
          throttledFn.bind(this, project.id.toString(), workspaceId),
        )
        .then((projectUsers: (ClockifyUser | TogglProjectUser)[]) => {
          const userIds = projectUsers.map(projectUser =>
            'uid' in projectUser ? projectUser.uid : projectUser.id,
          );
          set(project, 'userIds', userIds);
        });
    } catch (error) {
      if (error.status !== 403) throw error;
    }
  }
};

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
  const projectRecordsInWorkspace = selectProjectsTransferPayloadForWorkspace(
    state,
    togglWorkspaceId,
  );
  if (projectRecordsInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyProjectsTransfer.request());

  const onProjectRecord = (projectRecord: any) => {
    const transferRecord = { ...projectRecord, type: EntityType.Project };
    dispatch(updateInTransferEntity(transferRecord));
  };

  try {
    const projects = await batchClockifyRequests(
      onProjectRecord,
      projectRecordsInWorkspace,
      apiCreateClockifyProject,
      clockifyWorkspaceId,
    );

    return dispatch(clockifyProjectsTransfer.success(projects));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyProjectsTransfer.failure());
  }
};
