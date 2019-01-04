import { createAction } from 'redux-actions';
import PromiseThrottle from 'promise-throttle';
import set from 'lodash/set';
import {
  apiFetchClockifyWorkspaces,
  apiFetchTogglWorkspaces,
  apiFetchTogglWorkspaceSummaryForYear,
} from '../api/workspaces';
import { selectTogglUserEmail } from '../../credentials/credentialsSelectors';
import { showFetchErrorNotification } from '../../app/appActions';
import {
  fetchClockifyClients,
  fetchTogglClients,
  updateIsClientIncluded,
} from '../clients/clientsActions';
import {
  fetchClockifyProjects,
  fetchTogglProjects,
  updateIsProjectIncluded,
} from '../projects/projectsActions';
import {
  fetchClockifyTags,
  fetchTogglTags,
  updateIsTagIncluded,
} from '../tags/tagsActions';
import {
  fetchClockifyTasks,
  fetchTogglTasks,
  updateIsTaskIncluded,
} from '../tasks/tasksActions';
import { fetchTogglTimeEntries } from '../timeEntries/timeEntriesActions';
import {
  fetchClockifyUserGroups,
  fetchTogglUserGroups,
  updateIsUserGroupIncluded,
} from '../userGroups/userGroupsActions';
import {
  fetchClockifyUsers,
  fetchTogglUsers,
  updateIsUserIncluded,
} from '../users/usersActions';
import { EntityGroup, EntityModel, ToolName } from '../../../types/commonTypes';
import {
  ClockifyWorkspace,
  TogglWorkspace,
  WorkspaceModel,
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
export const appendUserIdsToWorkspace = createAction(
  '@workspaces/APPEND_USER_IDS',
  (toolName: ToolName, workspaceId: string, userIds: string[]) => ({
    toolName,
    workspaceId,
    userIds,
  }),
);
export const updateIsWorkspaceIncluded = createAction(
  '@workspaces/UPDATE_IS_INCLUDED',
  (workspaceId: string) => workspaceId,
);
export const updateIsWorkspaceYearIncluded = createAction(
  '@workspaces/UPDATE_IS_YEAR_INCLUDED',
  (workspaceId: string, year: string) => ({ workspaceId, year }),
);
export const updateWorkspaceNameBeingFetched = createAction(
  '@workspaces/UPDATE_NAME_BEING_FETCHED',
  (workspaceName: string | null) => workspaceName,
);

export const fetchClockifyWorkspaces = () => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyWorkspacesFetchStarted());
  try {
    const workspaces = await apiFetchClockifyWorkspaces();
    return dispatch(clockifyWorkspacesFetchSuccess(workspaces));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyWorkspacesFetchFailure());
  }
};

export const fetchClockifyEntitiesForWorkspace = (
  workspaceRecord: WorkspaceModel,
) => async (dispatch: Dispatch<any>) => {
  const { name, id } = workspaceRecord;

  dispatch(updateWorkspaceNameBeingFetched(name));
  await dispatch(fetchClockifyClients(id));
  await dispatch(fetchClockifyProjects(id));
  await dispatch(fetchClockifyTags(id));
  await dispatch(fetchClockifyTasks(id));
  await dispatch(fetchClockifyUserGroups(id));
  await dispatch(fetchClockifyUsers(id));
  return dispatch(updateWorkspaceNameBeingFetched(null));
};

export const fetchTogglWorkspaces = () => async (dispatch: Dispatch<any>) => {
  dispatch(togglWorkspacesFetchStarted());
  try {
    const workspaces = await apiFetchTogglWorkspaces();
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

  dispatch(updateWorkspaceNameBeingFetched(name));
  await dispatch(fetchTogglClients(id));
  await dispatch(fetchTogglProjects(id));
  await dispatch(fetchTogglTags(id));
  await dispatch(fetchTogglTasks(id));
  await dispatch(fetchTogglUserGroups(id));
  await dispatch(fetchTogglUsers(id));
  for (const inclusionYear of inclusionYears) {
    await dispatch(fetchTogglTimeEntries(id, inclusionYear));
  }
  return dispatch(updateWorkspaceNameBeingFetched(null));
};

export const updateIsWorkspaceEntityIncluded = (
  entityGroup: EntityGroup,
  entityRecord: EntityModel,
) => (dispatch: Dispatch<any>) => {
  const updateAction = {
    [EntityGroup.Clients]: updateIsClientIncluded,
    [EntityGroup.Projects]: updateIsProjectIncluded,
    [EntityGroup.Tags]: updateIsTagIncluded,
    [EntityGroup.Tasks]: updateIsTaskIncluded,
    [EntityGroup.UserGroups]: updateIsUserGroupIncluded,
    [EntityGroup.Users]: updateIsUserIncluded,
  }[entityGroup];

  return dispatch(updateAction(entityRecord.id));
};
