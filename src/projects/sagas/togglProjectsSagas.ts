/* eslint-disable @typescript-eslint/camelcase */
import { call, delay, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import {
  createTogglProjects,
  fetchTogglProjects,
} from "~/projects/projectsActions";
import { selectTargetProjectsForTransfer } from "~/projects/projectsSelectors";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
import { ProjectModel } from "~/projects/projectsTypes";

interface TogglProjectResponseModel {
  id: number;
  wid: number;
  cid: number;
  name: string;
  billable: boolean;
  is_private: boolean;
  active: boolean;
  template: boolean;
  at: string;
  created_at: string;
  color: string;
  auto_estimates: boolean;
  actual_hours: number;
  hex_color: string;
}

interface TogglProjectRequestModel {
  name: string;
  wid: number;
  template_id: number;
  is_private: boolean;
  cid: number;
}

interface TogglProjectUserResponseModel {
  id: number;
  pid: number;
  uid: number;
  wid: number;
  manager: boolean;
  rate: number;
}

/**
 * Creates a Toggl project and returns the response as { data: [New Project] }.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/projects.md#create-project
 */
export function* createTogglProjectsSaga(
  action: ActionType<typeof createTogglProjects.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const newProjects: ProjectModel[] = yield select(
      selectTargetProjectsForTransfer,
      workspaceId,
    );
    yield call(startGroupTransfer, EntityGroup.Projects, newProjects.length);

    for (const newProject of newProjects) {
      yield call(incrementTransferCounts);
      yield call(createTogglProject, workspaceId, newProject);
      yield delay(500);
    }

    yield put(createTogglProjects.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTogglProjects.failure());
  }
}

/**
 * Fetches all projects in Toggl workspace, adds associated user IDs, and
 * updates state with result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-projects
 */
export function* fetchTogglProjectsSaga(
  action: ActionType<typeof fetchTogglProjects.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const togglProjects: TogglProjectResponseModel[] = yield call(
      fetchArray,
      `/toggl/api/workspaces/${workspaceId}/projects?active=both`,
    );

    const recordsById: Record<string, ProjectModel> = {};

    for (const togglProject of togglProjects) {
      const projectId = togglProject.id.toString();
      const userIds: string[] = yield call(fetchUserIdsInProject, projectId);
      recordsById[projectId] = transformFromResponse(
        togglProject,
        workspaceId,
        userIds,
      );
      yield delay(500);
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Toggl);

    yield put(fetchTogglProjects.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTogglProjects.failure());
  }
}

/**
 * Creates a Toggl project and returns the response as { data: [New Project] }.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/projects.md#create-project
 */
function* createTogglProject(
  workspaceId: string,
  project: ProjectModel,
): SagaIterator {
  const projectRequest = transformToRequest(project);
  yield call(fetchObject, "/toggl/api/projects", {
    method: HttpMethod.Post,
    body: projectRequest,
  });
}

/**
 * Fetches the users associated with a specific project and returns an array
 * of strings that represents the user ID.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/projects.md#get-project-users
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/project_users.md
 */
function* fetchUserIdsInProject(projectId: string): SagaIterator<string[]> {
  const projectUsers: TogglProjectUserResponseModel[] = yield call(
    fetchArray,
    `/toggl/api/projects/${projectId}/project_users`,
  );
  return projectUsers.map(({ uid }) => uid.toString());
}

function transformToRequest(project: ProjectModel): TogglProjectRequestModel {
  return {
    name: project.name,
    wid: +project.workspaceId,
    template_id: 10237,
    is_private: !project.isPublic,
    cid: +project.clientId,
  };
}

function transformFromResponse(
  project: TogglProjectResponseModel,
  workspaceId: string,
  userIds: string[],
): ProjectModel {
  return {
    id: project.id.toString(),
    name: project.name,
    workspaceId,
    clientId: project.cid.toString(),
    isBillable: project.billable,
    isPublic: !project.is_private,
    isActive: project.active,
    color: project.hex_color,
    userIds,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Projects,
  };
}
