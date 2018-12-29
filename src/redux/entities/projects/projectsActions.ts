import { createAction } from 'redux-actions';
import PromiseThrottle from 'promise-throttle';
import set from 'lodash/set';
import {
  apiFetchClockifyProjects,
  apiFetchClockifyProjectUsers,
  apiFetchTogglProjects,
  apiFetchTogglProjectUsers,
} from '../api/projects';
import { showFetchErrorNotification } from '../../app/appActions';
import {
  ClockifyProject,
  ProjectUserModel,
  TogglProject,
  TogglProjectUser,
} from '../../../types/projectsTypes';
import { ClockifyUser } from '../../../types/userTypes';
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

const appendUsersToProject = async (
  projects: (TogglProject | ClockifyProject)[],
  fetchUsersForProjectFn: (projectId: string) => Promise<any>,
) => {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 4,
    promiseImplementation: Promise,
  });

  for (const project of projects) {
    try {
      await promiseThrottle
        .add(
          // @ts-ignore
          fetchUsersForProjectFn.bind(this, project.id.toString()),
        )
        .then((users: ProjectUserModel[]) => {
          set(project, 'users', users);
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

    const fetchUsersForProject = (projectId: string) =>
      new Promise((resolve, reject) =>
        apiFetchClockifyProjectUsers(workspaceId, projectId)
          .then((projectUsers: ClockifyUser[]) => {
            const userRecords = projectUsers.map(({ id }) => ({
              id,
              isManager: null,
            }));
            resolve(userRecords);
          })
          .catch(error => {
            reject(error);
          }),
      );

    await appendUsersToProject(projects, fetchUsersForProject);
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

    const fetchUsersForProject = (projectId: string) =>
      new Promise((resolve, reject) =>
        apiFetchTogglProjectUsers(projectId)
          .then((projectUsers: TogglProjectUser[]) => {
            const userRecords = projectUsers.map(({ uid, manager }) => ({
              id: uid.toString(),
              isManager: manager,
            }));
            resolve(userRecords);
          })
          .catch(error => {
            reject(error);
          }),
      );

    await appendUsersToProject(projects, fetchUsersForProject);
    return dispatch(togglProjectsFetchSuccess(projects));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglProjectsFetchFailure());
  }
};
