import { createAction } from 'redux-actions';
import PromiseThrottle from 'promise-throttle';
import get from 'lodash/get';
import set from 'lodash/set';
import {
  apiFetchClockifyWorkspaces,
  apiFetchClockifyWorkspaceUsers,
  apiFetchTogglWorkspaces,
  apiFetchTogglWorkspaceSummaryForYear,
  apiFetchTogglWorkspaceUsers,
} from '../api/workspaces';
import { showFetchErrorNotification } from '../../app/appActions';
import { fetchTogglClients } from '../clients/clientsActions';
import { fetchTogglProjects } from '../projects/projectsActions';
import { fetchTogglTags } from '../tags/tagsActions';
import { fetchTogglTasks } from '../tasks/tasksActions';
import { fetchTogglTimeEntries } from '../timeEntries/timeEntriesActions';
import { selectTogglUserEmail } from '../user/userSelectors';
import { fetchTogglUserGroups } from '../userGroups/userGroupsActions';
import { ClockifyUser } from '../../../types/userTypes';
import {
  ClockifyWorkspace,
  TogglWorkspace,
  TogglWorkspaceUser,
  WorkspaceModel,
  WorkspaceUserModel,
} from '../../../types/workspacesTypes';
import { Dispatch, GetState } from '../../rootReducer';

export const clockifyWorkspacesFetchStarted = createAction(
  '@workspaces/CLOCKIFY_FETCH_STARTED',
);
export const clockifyWorkspacesFetchSuccess = createAction(
  '@workspaces/CLOCKIFY_FETCH_SUCCESS',
  (response: ClockifyWorkspace[]) => response,
);
export const clockifyWorkspacesFetchFailure = createAction(
  '@workspaces/CLOCKIFY_FETCH_FAILURE',
);
export const togglWorkspacesFetchStarted = createAction(
  '@workspaces/TOGGL_FETCH_STARTED',
);
export const togglWorkspacesFetchSuccess = createAction(
  '@workspaces/TOGGL_FETCH_SUCCESS',
  (response: TogglWorkspace[]) => response,
);
export const togglWorkspacesFetchFailure = createAction(
  '@workspaces/TOGGL_FETCH_FAILURE',
);
export const togglWorkspaceSummaryFetchStarted = createAction(
  '@workspaces/TOGGL_SUMMARY_FETCH_STARTED',
);
export const togglWorkspaceSummaryFetchSuccess = createAction(
  '@workspaces/TOGGL_SUMMARY_FETCH_SUCCESS',
  (workspaceId: string, inclusionsByYear: Record<string, boolean>) => ({
    workspaceId,
    inclusionsByYear,
  }),
);
export const togglWorkspaceSummaryFetchFailure = createAction(
  '@workspaces/TOGGL_SUMMARY_FETCH_FAILURE',
);
export const updateIsWorkspaceIncluded = createAction(
  '@workspaces/UPDATE_IS_INCLUDED',
  (workspaceId: string) => workspaceId,
);
export const updateIsWorkspaceYearIncluded = createAction(
  '@workspaces/UPDATE_IS_YEAR_INCLUDED',
  (workspaceId: string, year: string) => ({ workspaceId, year }),
);
export const updateEntitiesFetchDetails = createAction(
  '@workspaces/UPDATE_ENTITIES_FETCH_DETAILS',
  (entityName: string | null, workspaceName?: string | null) => ({
    entityName,
    workspaceName,
  }),
);

export const appendUsersToWorkspace = async (
  workspaces: (TogglWorkspace | ClockifyWorkspace)[],
  apiFetchUsersFn: (workspaceId: string) => Promise<any>,
) => {
  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 4,
    promiseImplementation: Promise,
  });

  const fetchUsersForWorkspace = (workspaceId: string) =>
    new Promise((resolve, reject) =>
      apiFetchUsersFn(workspaceId)
        .then((workspaceUsers: (ClockifyUser | TogglWorkspaceUser)[]) => {
          const userRecords = workspaceUsers.map(workspaceUser => ({
            id:
              'uid' in workspaceUser
                ? workspaceUser.uid.toString()
                : workspaceUser.id,
            name: workspaceUser.name,
            email: workspaceUser.email,
            isAdmin: get(workspaceUser, 'admin', null),
            isActive:
              'active' in workspaceUser
                ? workspaceUser.active
                : workspaceUser.status === 'ACTIVE',
          }));
          resolve(userRecords);
        })
        .catch(error => {
          reject(error);
        }),
    );

  for (const workspace of workspaces) {
    try {
      await promiseThrottle
        .add(
          // @ts-ignore
          fetchUsersForWorkspace.bind(this, workspace.id.toString()),
        )
        .then((users: WorkspaceUserModel[]) => {
          set(workspace, 'users', users);
        });
    } catch (error) {
      if (error.status !== 403) throw error;
    }
  }
};

export const fetchClockifyWorkspaces = () => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyWorkspacesFetchStarted());
  try {
    const workspaces = await apiFetchClockifyWorkspaces();
    await appendUsersToWorkspace(workspaces, apiFetchClockifyWorkspaceUsers);
    return dispatch(clockifyWorkspacesFetchSuccess(workspaces));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyWorkspacesFetchFailure());
  }
};

export const fetchTogglWorkspaces = () => async (dispatch: Dispatch<any>) => {
  dispatch(togglWorkspacesFetchStarted());
  try {
    const workspaces = await apiFetchTogglWorkspaces();
    await appendUsersToWorkspace(workspaces, apiFetchTogglWorkspaceUsers);
    return dispatch(togglWorkspacesFetchSuccess(workspaces));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglWorkspacesFetchFailure());
  }
};

export const fetchTogglWorkspaceSummary = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
  getState: GetState,
) => {
  dispatch(togglWorkspaceSummaryFetchStarted());
  try {
    const email = selectTogglUserEmail(getState());

    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 4,
      promiseImplementation: Promise,
    });

    const fetchSummaryForYear = (workspaceId: string, year: number) =>
      new Promise((resolve, reject) =>
        apiFetchTogglWorkspaceSummaryForYear(email, workspaceId, year)
          .then(({ data }) => {
            const entryCount = data.reduce(
              (acc, { items }) => acc + items.length,
              0,
            );
            resolve(entryCount);
          })
          .catch(error => {
            reject(error);
          }),
      );

    const inclusionsByYear = {};
    let yearToFetch = new Date().getFullYear();
    while (yearToFetch > 2007) {
      await promiseThrottle
        .add(
          // @ts-ignore
          fetchSummaryForYear.bind(this, workspaceId, yearToFetch),
        )
        .then((entryCount: number) => {
          if (entryCount > 0) set(inclusionsByYear, yearToFetch, true);
        });
      yearToFetch -= 1;
    }

    return dispatch(
      togglWorkspaceSummaryFetchSuccess(workspaceId, inclusionsByYear),
    );
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglWorkspaceSummaryFetchFailure());
  }
};

export const fetchTogglEntitiesForWorkspace = (
  workspaceRecord: WorkspaceModel,
) => async (dispatch: Dispatch<any>) => {
  const { name, id, inclusionsByYear } = workspaceRecord;

  const inclusionYears = Object.entries(inclusionsByYear).reduce(
    (acc, [year, isIncluded]) => {
      if (!isIncluded) return acc;
      return [...acc, +year];
    },
    [],
  );

  dispatch(updateEntitiesFetchDetails('clients', name));
  await dispatch(fetchTogglClients(id));

  dispatch(updateEntitiesFetchDetails('projects'));
  await dispatch(fetchTogglProjects(id));

  dispatch(updateEntitiesFetchDetails('tags'));
  await dispatch(fetchTogglTags(id));

  dispatch(updateEntitiesFetchDetails('tasks'));
  await dispatch(fetchTogglTasks(id));

  dispatch(updateEntitiesFetchDetails('user groups'));
  await dispatch(fetchTogglUserGroups(id));

  dispatch(updateEntitiesFetchDetails('time entries'));
  for (const inclusionYear of inclusionYears) {
    await dispatch(fetchTogglTimeEntries(id, inclusionYear));
  }

  return dispatch(updateEntitiesFetchDetails(null, null));
};
