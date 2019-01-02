import { createAction } from 'redux-actions';
import PromiseThrottle from 'promise-throttle';
import property from 'lodash/property';
import set from 'lodash/set';
import {
  apiFetchClockifyProjects,
  apiFetchTogglProjects,
} from '../api/projects';
import {
  apiFetchClockifyUsersInProject,
  apiFetchTogglUsersInProject,
} from '../api/users';
import { showFetchErrorNotification } from '../../app/appActions';
import {
  ClockifyProject,
  TogglProject,
  TogglProjectUser,
} from '../../../types/projectsTypes';
import { ClockifyUser } from '../../../types/usersTypes';
import { Dispatch } from '../../rootReducer';

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
export const updateIsProjectIncluded = createAction(
  '@projects/UPDATE_IS_INCLUDED',
  (projectId: string) => projectId,
);

const appendUserIdsToProject = async (
  projects: (TogglProject | ClockifyProject)[],
  apiFetchUsersFn: (projectId: string, workspaceId?: string) => Promise<any>,
  workspaceId?: string,
) => {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 4,
    promiseImplementation: Promise,
  });

  const fetchUsersForProject = (projectId: string) =>
    new Promise((resolve, reject) =>
      apiFetchUsersFn(projectId, workspaceId)
        .then((projectUsers: (ClockifyUser | TogglProjectUser)[]) => {
          const userIds = projectUsers.map(property('id'));
          resolve(userIds);
        })
        .catch(error => {
          reject(error);
        }),
    );

  for (const project of projects) {
    try {
      await promiseThrottle
        .add(
          // @ts-ignore
          fetchUsersForProject.bind(this, project.id.toString()),
        )
        .then((userIds: string[]) => {
          set(project, 'userIds', userIds);
        });
    } catch (error) {
      if (error.status !== 403) throw error;
    }
  }
};

export const fetchClockifyProjects = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyProjectsFetchStarted());
  try {
    const projects = await apiFetchClockifyProjects(workspaceId);
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
  dispatch: Dispatch<any>,
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
