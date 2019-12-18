import { createAsyncAction, createAction } from "typesafe-actions";
import { set } from "lodash";
import { batchClockifyTransferRequests, buildThrottler } from "~/redux/utils";
import {
  apiCreateClockifyProject,
  apiFetchClockifyProjects,
  apiFetchTogglProjects,
} from "~/redux/entities/api/projects";
import {
  apiFetchClockifyUsersInProject,
  apiFetchTogglUsersInProject,
} from "~/redux/entities/api/users";
import { showFetchErrorNotification } from "~/redux/app/appActions";
import { selectProjectsTransferPayloadForWorkspace } from "./projectsSelectors";
import {
  ClockifyProjectModel,
  ClockifyUserModel,
  EntitiesFetchPayloadModel,
  EntityGroup,
  ReduxDispatch,
  ReduxGetState,
  TogglProjectModel,
  TogglProjectUserModel,
} from "~/types";

export const clockifyProjectsFetch = createAsyncAction(
  "@projects/CLOCKIFY_FETCH_REQUEST",
  "@projects/CLOCKIFY_FETCH_SUCCESS",
  "@projects/CLOCKIFY_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyProjectModel>, void>();

export const togglProjectsFetch = createAsyncAction(
  "@projects/TOGGL_FETCH_REQUEST",
  "@projects/TOGGL_FETCH_SUCCESS",
  "@projects/TOGGL_FETCH_FAILURE",
)<void, EntitiesFetchPayloadModel<TogglProjectModel>, void>();

export const clockifyProjectsTransfer = createAsyncAction(
  "@projects/CLOCKIFY_TRANSFER_REQUEST",
  "@projects/CLOCKIFY_TRANSFER_SUCCESS",
  "@projects/CLOCKIFY_TRANSFER_FAILURE",
)<void, EntitiesFetchPayloadModel<ClockifyProjectModel>, void>();

export const flipIsProjectIncluded = createAction("@projects/FLIP_IS_INCLUDED")<
  string
>();

export const fetchClockifyProjects = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(clockifyProjectsFetch.request());
  try {
    const projects = await apiFetchClockifyProjects(workspaceId);
    await appendUserIdsToProject(
      projects,
      apiFetchClockifyUsersInProject,
      workspaceId,
    );

    return dispatch(
      clockifyProjectsFetch.success({ entityRecords: projects, workspaceId }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
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

    return dispatch(
      togglProjectsFetch.success({ entityRecords: projects, workspaceId }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    return dispatch(togglProjectsFetch.failure());
  }
};

export const transferProjectsToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const projectsInWorkspace = selectProjectsTransferPayloadForWorkspace(state)(
    togglWorkspaceId,
  );
  if (projectsInWorkspace.length === 0) {
    return Promise.resolve();
  }

  dispatch(clockifyProjectsTransfer.request());

  try {
    const projects = await batchClockifyTransferRequests({
      requestsPerSecond: 4,
      dispatch,
      entityGroup: EntityGroup.Projects,
      entityRecordsInWorkspace: projectsInWorkspace,
      apiFunc: apiCreateClockifyProject,
      clockifyWorkspaceId,
      togglWorkspaceId,
    });

    return dispatch(
      clockifyProjectsTransfer.success({
        entityRecords: projects,
        workspaceId: clockifyWorkspaceId,
      }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyProjectsTransfer.failure());
  }
};

async function appendUserIdsToProject<TPayload>(
  projects: Array<TogglProjectModel | ClockifyProjectModel>,
  apiFetchUsersFunc: (
    projectId: string,
    workspaceId?: string,
  ) => Promise<TPayload>,
  workspaceId?: string,
): Promise<void> {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    4,
    apiFetchUsersFunc,
  );

  for (const project of projects) {
    try {
      await promiseThrottle
        .add(
          // @ts-ignore
          throttledFunc.bind(this, project.id.toString(), workspaceId),
        )
        .then(
          (projectUsers: Array<ClockifyUserModel | TogglProjectUserModel>) => {
            const userIds = projectUsers.map(projectUser =>
              "uid" in projectUser ? projectUser.uid : projectUser.id,
            );
            set(project, "userIds", userIds);
          },
        );
    } catch (err) {
      if (err.status !== 403) {
        throw err;
      }
    }
  }
}
