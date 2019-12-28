/* eslint-disable @typescript-eslint/camelcase */
import * as R from "ramda";
import { call, delay, select } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { TOGGL_API_DELAY } from "~/constants";
import {
  createEntitiesForTool,
  fetchArray,
  fetchEntitiesForTool,
  fetchObject,
} from "~/redux/sagaUtils";
import { selectTargetClientId } from "~/clients/clientsSelectors";
import { EntityGroup, ToolName } from "~/entities/entitiesTypes";
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
    apiCreateFunc: createTogglProject,
  });
}

/**
 * Fetches all projects in Toggl workspaces, adds associated user IDs, and
 * returns array of transformed projects.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-projects
 */
export function* fetchTogglProjectsSaga(): SagaIterator<ProjectModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglProjectsInWorkspace,
  });
}

function* createTogglProject(
  sourceProject: ProjectModel,
  targetWorkspaceId: string,
): SagaIterator<ProjectModel> {
  const targetClientId = yield select(
    selectTargetClientId,
    sourceProject.clientId,
  );
  const projectRequest = {
    name: sourceProject.name,
    wid: +targetWorkspaceId,
    // TODO: Find out if this template_id value is valid?
    template_id: 10237,
    is_private: !sourceProject.isPublic,
    cid: R.isNil(targetClientId) ? undefined : +targetClientId,
  };

  const { data } = yield call(fetchObject, "/toggl/api/projects", {
    method: "POST",
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

function transformFromResponse(
  project: TogglProjectResponseModel,
  userIds: string[],
): ProjectModel {
  return {
    id: project.id.toString(),
    name: project.name,
    workspaceId: project.wid.toString(),
    clientId: project.cid ? project.cid.toString() : null,
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
