import { createAsyncAction, createAction } from "typesafe-actions";
import { batchClockifyTransferRequests, paginatedFetch } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectClockifyProjectIds } from "~/projects/projectsSelectors";
import {
  apiCreateClockifyTask,
  apiFetchClockifyTasks,
  apiFetchTogglTasks,
} from "./tasksApi";
import { selectTasksTransferPayloadForWorkspace } from "./tasksSelectors";
import { EntitiesFetchPayloadModel, EntityGroup } from "~/common/commonTypes";
import { ReduxDispatch, ReduxGetState } from "~/redux/reduxTypes";
import { ClockifyTaskModel, TogglTaskModel } from "./tasksTypes";

export const clockifyTasksFetch = createAsyncAction(
  "@tasks/CLOCKIFY_FETCH_REQUEST",
  "@tasks/CLOCKIFY_FETCH_SUCCESS",
  "@tasks/CLOCKIFY_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyTaskModel>, void>();

export const togglTasksFetch = createAsyncAction(
  "@tasks/TOGGL_FETCH_REQUEST",
  "@tasks/TOGGL_FETCH_SUCCESS",
  "@tasks/TOGGL_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<TogglTaskModel>, void>();

export const clockifyTasksTransfer = createAsyncAction(
  "@tasks/CLOCKIFY_TRANSFER_REQUEST",
  "@tasks/CLOCKIFY_TRANSFER_SUCCESS",
  "@tasks/CLOCKIFY_TRANSFER_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyTaskModel>, void>();

export const flipIsTaskIncluded = createAction("@tasks/FLIP_IS_INCLUDED")<
  string
>();

export const fetchClockifyTasks = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(clockifyTasksFetch.request());

  try {
    const state = getState();
    const projectIds = selectClockifyProjectIds(state);

    const tasks: ClockifyTaskModel[] = [];
    for (const projectId of projectIds) {
      const projectTasks = await paginatedFetch({
        apiFetchFunc: apiFetchClockifyTasks,
        funcArgs: [workspaceId, projectId],
      });
      tasks.push(...projectTasks);
    }

    dispatch(clockifyTasksFetch.success({ entityRecords: tasks, workspaceId }));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyTasksFetch.failure());
  }
};

export const fetchTogglTasks = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglTasksFetch.request());

  try {
    const tasks = await apiFetchTogglTasks(workspaceId);
    dispatch(togglTasksFetch.success({ entityRecords: tasks, workspaceId }));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(togglTasksFetch.failure());
  }
};

export const transferTasksToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const tasksInWorkspace = selectTasksTransferPayloadForWorkspace(state)(
    togglWorkspaceId,
  );
  if (tasksInWorkspace.length === 0) {
    return;
  }

  dispatch(clockifyTasksTransfer.request());

  try {
    const tasks = await batchClockifyTransferRequests({
      requestsPerSecond: 4,
      dispatch,
      entityGroup: EntityGroup.Tasks,
      entityRecordsInWorkspace: tasksInWorkspace,
      apiFunc: apiCreateClockifyTask,
      clockifyWorkspaceId,
      togglWorkspaceId,
    });

    dispatch(
      clockifyTasksTransfer.success({
        entityRecords: tasks,
        workspaceId: clockifyWorkspaceId,
      }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyTasksTransfer.failure());
  }
};
