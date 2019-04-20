import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { isNil } from 'lodash';
import {
  apiFetchClockifyWorkspaces,
  apiFetchTogglWorkspaces,
  apiCreateClockifyWorkspace,
} from '~/redux/entities/api/workspaces';
import {
  showFetchErrorNotification,
  updateInTransferWorkspace,
} from '~/redux/app/appActions';
import * as clientsActions from '~/redux/entities/clients/clientsActions';
import * as projectsActions from '~/redux/entities/projects/projectsActions';
import * as tagsActions from '~/redux/entities/tags/tagsActions';
import * as tasksActions from '~/redux/entities/tasks/tasksActions';
import * as timeEntriesActions from '~/redux/entities/timeEntries/timeEntriesActions';
import * as userGroupsActions from '../userGroups/userGroupsActions';
import * as usersActions from '~/redux/entities/users/usersActions';
import { selectTogglIncludedWorkspaceNames } from './workspacesSelectors';
import {
  ClockifyWorkspaceModel,
  CompoundEntityModel,
  CompoundWorkspaceModel,
  EntityGroup,
  UpdateIncludedWorkspaceYearModel,
  ReduxDispatch,
  ReduxGetState,
  TogglWorkspaceModel,
  ToolName,
} from '~/types';

export const clockifyWorkspacesFetch = createAsyncAction(
  '@workspaces/CLOCKIFY_FETCH_REQUEST',
  '@workspaces/CLOCKIFY_FETCH_SUCCESS',
  '@workspaces/CLOCKIFY_FETCH_FAILURE',
)<void, Array<ClockifyWorkspaceModel>, void>();

export const togglWorkspacesFetch = createAsyncAction(
  '@workspaces/TOGGL_FETCH_REQUEST',
  '@workspaces/TOGGL_FETCH_SUCCESS',
  '@workspaces/TOGGL_FETCH_FAILURE',
)<void, Array<TogglWorkspaceModel>, void>();

export const clockifyWorkspaceTransfer = createAsyncAction(
  '@workspaces/CLOCKIFY_TRANSFER_REQUEST',
  '@workspaces/CLOCKIFY_TRANSFER_SUCCESS',
  '@workspaces/CLOCKIFY_TRANSFER_FAILURE',
)<void, Array<ClockifyWorkspaceModel>, void>();

export const appendUserIdsToWorkspace = createStandardAction(
  '@workspaces/APPEND_USER_IDS',
)<{ toolName: ToolName; workspaceId: string; userIds: Array<string> }>();

export const flipIsWorkspaceIncluded = createStandardAction(
  '@workspaces/FLIP_IS_INCLUDED',
)<string>();

export const updateIsWorkspaceYearIncluded = createStandardAction(
  '@workspaces/UPDATE_IS_WORKSPACE_YEAR_INCLUDED',
)<UpdateIncludedWorkspaceYearModel>();

export const updateWorkspaceNameBeingFetched = createStandardAction(
  '@workspaces/UPDATE_NAME_BEING_FETCHED',
)<string | null>();

export const resetContentsForTool = createStandardAction(
  '@workspaces/RESET_CONTENTS_FOR_TOOL',
)<ToolName>();

export const fetchClockifyWorkspaces = () => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  const state = getState();

  dispatch(clockifyWorkspacesFetch.request());

  try {
    dispatch(resetContentsForTool(ToolName.Clockify));
    const togglIncludedNames = selectTogglIncludedWorkspaceNames(state);

    const workspaces = await apiFetchClockifyWorkspaces();
    const includedWorkspaces = workspaces.filter(({ name }) =>
      togglIncludedNames.includes(name),
    );

    return dispatch(clockifyWorkspacesFetch.success(includedWorkspaces));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyWorkspacesFetch.failure());
  }
};

export const fetchClockifyEntitiesInWorkspace = ({
  name,
  id,
}: CompoundWorkspaceModel) => async (dispatch: ReduxDispatch) => {
  dispatch(updateWorkspaceNameBeingFetched(name));

  await dispatch(clientsActions.fetchClockifyClients(id));
  await dispatch(projectsActions.fetchClockifyProjects(id));
  await dispatch(tagsActions.fetchClockifyTags(id));
  await dispatch(tasksActions.fetchClockifyTasks(id));
  await dispatch(usersActions.fetchClockifyUsers(id));
  await dispatch(userGroupsActions.fetchClockifyUserGroups(id));
  await dispatch(timeEntriesActions.fetchClockifyTimeEntries(id));

  return dispatch(updateWorkspaceNameBeingFetched(null));
};

export const fetchTogglWorkspaces = () => async (dispatch: ReduxDispatch) => {
  dispatch(togglWorkspacesFetch.request());

  try {
    dispatch(resetContentsForTool(ToolName.Toggl));
    const workspaces = await apiFetchTogglWorkspaces();

    return dispatch(togglWorkspacesFetch.success(workspaces));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglWorkspacesFetch.failure());
  }
};

export const fetchTogglEntitiesInWorkspace = ({
  name,
  id,
}: CompoundWorkspaceModel) => async (dispatch: ReduxDispatch) => {
  dispatch(updateWorkspaceNameBeingFetched(name));

  await dispatch(clientsActions.fetchTogglClients(id));
  await dispatch(projectsActions.fetchTogglProjects(id));
  await dispatch(tagsActions.fetchTogglTags(id));
  await dispatch(tasksActions.fetchTogglTasks(id));
  await dispatch(usersActions.fetchTogglUsers(id));
  await dispatch(userGroupsActions.fetchTogglUserGroups(id));
  await dispatch(timeEntriesActions.fetchTogglTimeEntries(id));

  return dispatch(updateWorkspaceNameBeingFetched(null));
};

export const transferEntitiesToClockifyWorkspace = (
  workspace: CompoundWorkspaceModel,
) => async (dispatch: ReduxDispatch) => {
  const { name, id: togglWorkspaceId, linkedId } = workspace;

  let clockifyWorkspaceId = linkedId;

  dispatch(clockifyWorkspaceTransfer.request());
  try {
    dispatch(updateInTransferWorkspace(workspace));

    if (isNil(linkedId)) {
      const workspace = await apiCreateClockifyWorkspace({ name });
      clockifyWorkspaceId = workspace.id;
      dispatch(clockifyWorkspaceTransfer.success([workspace]));
    }

    await dispatch(
      clientsActions.transferClientsToClockify(
        togglWorkspaceId,
        clockifyWorkspaceId,
      ),
    );

    await dispatch(
      tagsActions.transferTagsToClockify(togglWorkspaceId, clockifyWorkspaceId),
    );

    await dispatch(
      projectsActions.transferProjectsToClockify(
        togglWorkspaceId,
        clockifyWorkspaceId,
      ),
    );

    await dispatch(
      tasksActions.transferTasksToClockify(
        togglWorkspaceId,
        clockifyWorkspaceId,
      ),
    );

    await dispatch(
      timeEntriesActions.transferTimeEntriesToClockify(
        togglWorkspaceId,
        clockifyWorkspaceId,
      ),
    );

    return dispatch(updateInTransferWorkspace(null));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyWorkspaceTransfer.failure());
  }
};

export const flipIsWorkspaceEntityIncluded = (
  entityGroup: EntityGroup,
  { id }: CompoundEntityModel,
) => (dispatch: ReduxDispatch) => {
  const updateAction = {
    [EntityGroup.Clients]: clientsActions.flipIsClientIncluded,
    [EntityGroup.Projects]: projectsActions.flipIsProjectIncluded,
    [EntityGroup.Tags]: tagsActions.flipIsTagIncluded,
    [EntityGroup.Tasks]: tasksActions.flipIsTaskIncluded,
    [EntityGroup.UserGroups]: userGroupsActions.flipIsUserGroupIncluded,
    [EntityGroup.Users]: usersActions.flipIsUserIncluded,
  }[entityGroup];

  return dispatch(updateAction(id));
};
