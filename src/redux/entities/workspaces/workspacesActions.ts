import { createAction } from 'redux-actions';
import isNil from 'lodash/isNil';
import set from 'lodash/set';
import { buildThrottler } from '../../utils';
import {
  apiCreateClockifyWorkspace,
  apiFetchClockifyWorkspaces,
  apiFetchTogglWorkspaceSummaryForYear,
} from '../api/workspaces';
import { showFetchErrorNotification } from '../../app/appActions';
import { selectTogglUserEmail } from '../../credentials/credentialsSelectors';
import {
  fetchClockifyClients,
  fetchTogglClients,
  transferClientsToClockify,
  updateIsClientIncluded,
} from '../clients/clientsActions';
import {
  fetchClockifyProjects,
  fetchTogglProjects,
  transferProjectsToClockify,
  updateIsProjectIncluded,
} from '../projects/projectsActions';
import {
  fetchClockifyTags,
  fetchTogglTags,
  transferTagsToClockify,
  updateIsTagIncluded,
} from '../tags/tagsActions';
import {
  fetchClockifyTasks,
  fetchTogglTasks,
  transferTasksToClockify,
  updateIsTaskIncluded,
} from '../tasks/tasksActions';
import {
  fetchClockifyTimeEntries,
  fetchTogglTimeEntries,
} from '../timeEntries/timeEntriesActions';
import {
  fetchClockifyUserGroups,
  fetchTogglUserGroups,
  transferUserGroupsToClockify,
  updateIsUserGroupIncluded,
} from '../userGroups/userGroupsActions';
import {
  fetchClockifyUsers,
  fetchTogglUsers,
  transferUsersToClockify,
  updateIsUserIncluded,
} from '../users/usersActions';
import { selectTogglIncludedWorkspaceNames } from './workspacesSelectors';
import { EntityGroup, EntityModel, ToolName } from '../../../types/commonTypes';
import {
  ClockifyWorkspace,
  TogglSummaryReportDataModel,
  TogglWorkspace,
  WorkspaceModel,
} from '../../../types/workspacesTypes';
import { Dispatch, GetState } from '../../rootReducer';

export const clockifyWorkspacesFetchStarted = createAction(
  '@workspaces/CLOCKIFY_FETCH_STARTED',
);
export const clockifyWorkspacesFetchSuccess = createAction(
  '@workspaces/CLOCKIFY_FETCH_SUCCESS',
  (workspaces: ClockifyWorkspace[]) => workspaces,
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
export const clockifyWorkspaceTransferStarted = createAction(
  '@workspaces/CLOCKIFY_TRANSFER_STARTED',
);
export const clockifyWorkspaceTransferSuccess = createAction(
  '@workspaces/CLOCKIFY_TRANSFER_SUCCESS',
  (workspaces: ClockifyWorkspace[]) => workspaces,
);
export const clockifyWorkspaceTransferFailure = createAction(
  '@workspaces/CLOCKIFY_TRANSFER_FAILURE',
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
export const resetContentsForTool = createAction(
  '@workspaces/RESET_CONTENTS_FOR_TOOL',
  (toolName: ToolName) => toolName,
);

export const fetchClockifyWorkspaces = () => async (
  dispatch: Dispatch<any>,
  getState: GetState,
) => {
  const state = getState();

  dispatch(clockifyWorkspacesFetchStarted());
  try {
    dispatch(resetContentsForTool(ToolName.Clockify));
    const togglIncludedNames = selectTogglIncludedWorkspaceNames(state);

    const workspaces = await apiFetchClockifyWorkspaces();
    const includedWorkspaces = workspaces.filter(({ name }) =>
      togglIncludedNames.includes(name),
    );

    return dispatch(clockifyWorkspacesFetchSuccess(includedWorkspaces));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyWorkspacesFetchFailure());
  }
};

export const fetchClockifyEntitiesInWorkspace = (
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
  await dispatch(fetchClockifyTimeEntries(id));

  return dispatch(updateWorkspaceNameBeingFetched(null));
};

export const fetchTogglEntitiesInWorkspace = (
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

export const fetchTogglWorkspaceSummary = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
  getState: GetState,
) => {
  const state = getState();

  dispatch(togglWorkspaceSummaryFetchStarted());
  try {
    const email = selectTogglUserEmail(state);
    const { promiseThrottle, throttledFn } = buildThrottler(
      apiFetchTogglWorkspaceSummaryForYear,
    );

    const inclusionsByYear = {};
    let yearToFetch = new Date().getFullYear();
    while (yearToFetch > 2007) {
      await promiseThrottle
        .add(
          // @ts-ignore
          throttledFn.bind(this, email, workspaceId, yearToFetch),
        )
        .then(({ data }: { data: TogglSummaryReportDataModel[] }) => {
          const entryCount = data.reduce(
            (acc, { items }) => acc + items.length,
            0,
          );
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

export const transferEntitiesToClockifyWorkspace = (
  workspaceRecord: WorkspaceModel,
) => async (dispatch: Dispatch<any>) => {
  const { name, id: togglWorkspaceId, linkedId } = workspaceRecord;
  let clockifyWorkspaceId = linkedId;

  dispatch(clockifyWorkspaceTransferStarted());
  try {
    dispatch(updateWorkspaceNameBeingFetched(name));
    if (isNil(linkedId)) {
      const workspace = await apiCreateClockifyWorkspace({ name });
      clockifyWorkspaceId = workspace.id;
      dispatch(clockifyWorkspaceTransferSuccess([workspace]));
    }

    await dispatch(
      transferClientsToClockify(togglWorkspaceId, clockifyWorkspaceId),
    );
    await dispatch(
      transferProjectsToClockify(togglWorkspaceId, clockifyWorkspaceId),
    );
    await dispatch(
      transferTagsToClockify(togglWorkspaceId, clockifyWorkspaceId),
    );
    await dispatch(
      transferTasksToClockify(togglWorkspaceId, clockifyWorkspaceId),
    );
    await dispatch(
      transferUserGroupsToClockify(togglWorkspaceId, clockifyWorkspaceId),
    );
    // TODO: Follow up on this:
    // await dispatch(
    //   transferUsersToClockify(togglWorkspaceId, clockifyWorkspaceId),
    // );
    // TODO: Write a selector to get the appropriate time entries.
    // await dispatch(
    //   transferTimeEntriesToClockify(togglWorkspaceId, clockifyWorkspaceId),
    // );

    return dispatch(updateWorkspaceNameBeingFetched(null));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyWorkspaceTransferFailure());
  }
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
