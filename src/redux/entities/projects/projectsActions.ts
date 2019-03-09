import { createAction } from 'redux-actions';
import { property, set } from 'lodash';
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
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectProjectsTransferPayloadForWorkspace } from './projectsSelectors';
import {
  ClockifyProject,
  TogglProject,
  TogglProjectUser,
} from '~/types/projectsTypes';
import { ClockifyUser } from '~/types/usersTypes';
import { ReduxDispatch, ReduxGetState } from '~/types/commonTypes';

export const clockifyProjectsFetchStarted = createAction(
  '@projects/CLOCKIFY_FETCH_STARTED',
);
export const clockifyProjectsFetchSuccess = createAction(
  '@projects/CLOCKIFY_FETCH_SUCCESS',
  (projects: ClockifyProject[]) => projects,
);
export const clockifyProjectsFetchFailure = createAction(
  '@projects/CLOCKIFY_FETCH_FAILURE',
);
export const togglProjectsFetchStarted = createAction(
  '@projects/TOGGL_FETCH_STARTED',
);
export const togglProjectsFetchSuccess = createAction(
  '@projects/TOGGL_FETCH_SUCCESS',
  (projects: TogglProject[]) => projects,
);
export const togglProjectsFetchFailure = createAction(
  '@projects/TOGGL_FETCH_FAILURE',
);
export const clockifyProjectsTransferStarted = createAction(
  '@clients/CLOCKIFY_PROJECTS_TRANSFER_STARTED',
);
export const clockifyProjectsTransferSuccess = createAction(
  '@clients/CLOCKIFY_PROJECTS_TRANSFER_SUCCESS',
  (clients: ClockifyProject[]) => clients,
);
export const clockifyProjectsTransferFailure = createAction(
  '@clients/CLOCKIFY_PROJECTS_TRANSFER_FAILURE',
);
export const updateIsProjectIncluded = createAction(
  '@projects/UPDATE_IS_INCLUDED',
  (projectId: string) => projectId,
);

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
          const userIds = projectUsers.map(property('id'));
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
  dispatch(clockifyProjectsFetchStarted());
  try {
    const { project: projects } = await apiFetchClockifyProjects(workspaceId);
    await appendUserIdsToProject(
      projects,
      apiFetchClockifyUsersInProject,
      workspaceId,
    );

    return dispatch(clockifyProjectsFetchSuccess(projects));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyProjectsFetchFailure());
  }
};

export const fetchTogglProjects = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglProjectsFetchStarted());
  try {
    const projects = await apiFetchTogglProjects(workspaceId);
    await appendUserIdsToProject(projects, apiFetchTogglUsersInProject);

    return dispatch(togglProjectsFetchSuccess(projects));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglProjectsFetchFailure());
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

  dispatch(clockifyProjectsTransferStarted());
  try {
    const projects = await batchClockifyRequests(
      projectRecordsInWorkspace,
      apiCreateClockifyProject,
      clockifyWorkspaceId,
    );

    return dispatch(clockifyProjectsTransferSuccess(projects));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyProjectsTransferFailure());
  }
};
