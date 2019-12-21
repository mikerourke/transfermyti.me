import { createAsyncAction, createAction } from "typesafe-actions";
import { set } from "lodash";
import {
  batchClockifyTransferRequests,
  buildThrottler,
  paginatedFetch,
} from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  apiFetchClockifyUsersInProject,
  apiFetchTogglUsersInProject,
} from "~/users/usersApi";
import {
  apiCreateClockifyProject,
  apiFetchClockifyProjects,
  apiFetchTogglProjects,
} from "./projectsApi";
import { selectProjectsTransferPayloadForWorkspace } from "./projectsSelectors";
import { EntitiesFetchPayloadModel, EntityGroup } from "~/commonTypes";
import { ReduxDispatch, ReduxGetState } from "~/redux/reduxTypes";
import { ClockifyUserModel } from "~/users/usersTypes";
import {
  ClockifyProjectModel,
  TogglProjectModel,
  TogglProjectUserModel,
} from "./projectsTypes";

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
    const projects = await paginatedFetch({
      apiFetchFunc: apiFetchClockifyProjects,
      funcArgs: [workspaceId],
    });

    await appendUserIdsToProject(
      projects,
      apiFetchClockifyUsersInProject,
      workspaceId,
    );

    dispatch(
      clockifyProjectsFetch.success({ entityRecords: projects, workspaceId }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyProjectsFetch.failure());
  }
};

export const fetchTogglProjects = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
) => {
  dispatch(togglProjectsFetch.request());
  try {
    const projects = await apiFetchTogglProjects(workspaceId);
    await appendUserIdsToProject(projects, apiFetchTogglUsersInProject);
    dispatch(
      togglProjectsFetch.success({ entityRecords: projects, workspaceId }),
    );
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(togglProjectsFetch.failure());
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
    return;
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

    dispatch(
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
  projects: (TogglProjectModel | ClockifyProjectModel)[],
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
        .then((projectUsers: (ClockifyUserModel | TogglProjectUserModel)[]) => {
            const userIds = projectUsers.map(projectUser =>
              "uid" in projectUser ? projectUser.uid : projectUser.id,
            );
            set(project, "userIds", userIds);
        });
    } catch (err) {
      if (err.status !== 403) {
        throw err;
      }
    }
  }
}
