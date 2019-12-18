import { createAsyncAction, createAction } from "typesafe-actions";
import { isNil } from "lodash";
import {
  apiCreateClockifyWorkspace,
  apiFetchClockifyWorkspaces,
  apiFetchTogglWorkspaces,
} from "~/redux/entities/api/workspaces";
import {
  showFetchErrorNotification,
  updateCountsInWorkspace,
} from "~/redux/app/appActions";
import * as clientsActions from "~/redux/entities/clients/clientsActions";
import * as projectsActions from "~/redux/entities/projects/projectsActions";
import * as tagsActions from "~/redux/entities/tags/tagsActions";
import * as tasksActions from "~/redux/entities/tasks/tasksActions";
import * as timeEntriesActions from "~/redux/entities/timeEntries/timeEntriesActions";
import * as userGroupsActions from "~/redux/entities/userGroups/userGroupsActions";
import * as usersActions from "~/redux/entities/users/usersActions";
import {
  selectTogglIncludedWorkspaceNames,
  selectCountTotalOfTransfersInWorkspace,
} from "./workspacesSelectors";
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
} from "~/types";
import { pause } from "~/utils/pause";

export const clockifyWorkspacesFetch = createAsyncAction(
  "@workspaces/CLOCKIFY_FETCH_REQUEST",
  "@workspaces/CLOCKIFY_FETCH_SUCCESS",
  "@workspaces/CLOCKIFY_FETCH_FAILURE",
)<void, Array<ClockifyWorkspaceModel>, void>();

export const togglWorkspacesFetch = createAsyncAction(
  "@workspaces/TOGGL_FETCH_REQUEST",
  "@workspaces/TOGGL_FETCH_SUCCESS",
  "@workspaces/TOGGL_FETCH_FAILURE",
)<void, Array<TogglWorkspaceModel>, void>();

export const clockifyWorkspaceTransfer = createAsyncAction(
  "@workspaces/CLOCKIFY_TRANSFER_REQUEST",
  "@workspaces/CLOCKIFY_TRANSFER_SUCCESS",
  "@workspaces/CLOCKIFY_TRANSFER_FAILURE",
)<void, Array<ClockifyWorkspaceModel>, void>();

export const appendUserIdsToWorkspace = createAction(
  "@workspaces/APPEND_USER_IDS",
)<{ toolName: ToolName; workspaceId: string; userIds: Array<string> }>();

export const flipIsWorkspaceIncluded = createAction(
  "@workspaces/FLIP_IS_INCLUDED",
)<string>();

export const updateIsWorkspaceYearIncluded = createAction(
  "@workspaces/UPDATE_IS_WORKSPACE_YEAR_INCLUDED",
)<UpdateIncludedWorkspaceYearModel>();

export const updateWorkspaceNameBeingFetched = createAction(
  "@workspaces/UPDATE_NAME_BEING_FETCHED",
)<string | null>();

export const resetContentsForTool = createAction(
  "@workspaces/RESET_CONTENTS_FOR_TOOL",
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

    dispatch(clockifyWorkspacesFetch.success(includedWorkspaces));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyWorkspacesFetch.failure());
  }
};

export const fetchClockifyEntitiesInWorkspace = ({
  name,
  id,
}: CompoundWorkspaceModel) => async (
  dispatch: ReduxDispatch,
): Promise<void> => {
  dispatch(updateWorkspaceNameBeingFetched(name));

  await dispatch(clientsActions.fetchClockifyClients(id));
  await dispatch(projectsActions.fetchClockifyProjects(id));
  await dispatch(tagsActions.fetchClockifyTags(id));
  await dispatch(tasksActions.fetchClockifyTasks(id));
  await dispatch(usersActions.fetchClockifyUsers(id));
  await dispatch(userGroupsActions.fetchClockifyUserGroups(id));
  await dispatch(timeEntriesActions.fetchClockifyTimeEntries(id));

  dispatch(updateWorkspaceNameBeingFetched(null));
};

export const fetchTogglWorkspaces = () => async (dispatch: ReduxDispatch) => {
  dispatch(togglWorkspacesFetch.request());

  try {
    dispatch(resetContentsForTool(ToolName.Toggl));
    const workspaces = await apiFetchTogglWorkspaces();

    dispatch(togglWorkspacesFetch.success(workspaces));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(togglWorkspacesFetch.failure());
  }
};

export const fetchTogglEntitiesInWorkspace = ({
  name,
  id,
}: CompoundWorkspaceModel) => async (dispatch: ReduxDispatch) => {
  dispatch(updateWorkspaceNameBeingFetched(name));

  await dispatch(clientsActions.fetchTogglClients(id));
  await pause(1_000);
  await dispatch(projectsActions.fetchTogglProjects(id));
  await pause(1_000);
  await dispatch(tagsActions.fetchTogglTags(id));
  await pause(1_000);
  await dispatch(tasksActions.fetchTogglTasks(id));
  await pause(1_000);
  await dispatch(usersActions.fetchTogglUsers(id));
  await pause(1_000);
  await dispatch(userGroupsActions.fetchTogglUserGroups(id));
  await pause(1_000);
  await dispatch(timeEntriesActions.fetchTogglTimeEntries(id));

  dispatch(updateWorkspaceNameBeingFetched(null));
};

export const transferEntitiesToClockifyWorkspace = (
  workspace: CompoundWorkspaceModel,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const { name, id: togglWorkspaceId, linkedId } = workspace;

  let clockifyWorkspaceId = linkedId;

  dispatch(clockifyWorkspaceTransfer.request());
  try {
    dispatch(updateWorkspaceNameBeingFetched(name));

    if (isNil(linkedId)) {
      const workspace = await apiCreateClockifyWorkspace({ name });
      clockifyWorkspaceId = workspace.id;
      dispatch(clockifyWorkspaceTransfer.success([workspace]));
    }

    const countTotal = selectCountTotalOfTransfersInWorkspace(getState())(
      togglWorkspaceId,
    );

    dispatch(
      updateCountsInWorkspace({
        countCurrent: 0,
        countTotal,
      }),
    );

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

    dispatch(
      updateCountsInWorkspace({
        countCurrent: 0,
        countTotal: 0,
      }),
    );

    dispatch(updateWorkspaceNameBeingFetched(null));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyWorkspaceTransfer.failure());
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

  dispatch(updateAction(id));
};
