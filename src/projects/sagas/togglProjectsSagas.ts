/* eslint-disable @typescript-eslint/camelcase */
import { call, delay } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { TOGGL_API_DELAY } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import { createEntitiesForTool, fetchEntitiesForTool } from "~/redux/sagaUtils";
import { EntityGroup, HttpMethod, ToolName } from "~/common/commonTypes";
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
 * Creates new Toggl projects that correspond to source and returns an array of
 * transformed projects.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/projects.md#create-project
 */
export function* createTogglProjectsSaga(
  sourceProjects: ProjectModel[],
): SagaIterator<ProjectModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceProjects,
    creatorFunc: createTogglProject,
  });
}

/**
 * Fetches all projects in Toggl workspaces, adds associated user IDs, and
 * returns result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-projects
 */
export function* fetchTogglProjectsSaga(): SagaIterator<ProjectModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    fetchFunc: fetchTogglProjectsInWorkspace,
  });
}

function* createTogglProject(
  sourceProject: ProjectModel,
  workspaceId: string,
): SagaIterator<ProjectModel | null> {
  const projectRequest = transformToRequest(sourceProject, workspaceId);
  const { data } = yield call(fetchObject, `/toggl/api/projects`, {
    method: HttpMethod.Post,
    body: projectRequest,
  });

  return transformFromResponse(data, []);
}

function* fetchTogglProjectsInWorkspace(
  workspaceId: string,
): SagaIterator<ProjectModel[]> {
  const allTogglProjects: ProjectModel[] = [];

  const togglProjects: TogglProjectResponseModel[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/projects?active=both`,
  );

  for (const togglProject of togglProjects) {
    const projectId = togglProject.id.toString();
    const userIds: string[] = yield call(fetchUserIdsInProject, projectId);
    allTogglProjects.push(transformFromResponse(togglProject, userIds));

    yield delay(TOGGL_API_DELAY);
  }

  return allTogglProjects;
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

function transformToRequest(
  project: ProjectModel,
  workspaceId: string,
): TogglProjectRequestModel {
  return {
    name: project.name,
    wid: +workspaceId,
    template_id: 10237,
    is_private: !project.isPublic,
    cid: +project.clientId,
  };
}

function transformFromResponse(
  project: TogglProjectResponseModel,
  userIds: string[],
): ProjectModel {
  return {
    id: project.id.toString(),
    name: project.name,
    workspaceId: project.wid.toString(),
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
