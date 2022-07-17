import { isNil, propOr } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, delay, select } from "redux-saga/effects";

import {
  fetchArray,
  fetchEmpty,
  fetchObject,
  getApiDelayForTool,
} from "~/entityOperations/apiRequests";
import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { clientIdToLinkedIdSelector } from "~/modules/clients/clientsSelectors";
import { EntityGroup, ToolName, type Project } from "~/typeDefs";
import { validStringify } from "~/utilities/textTransforms";

interface TogglProjectResponse {
  id: number;
  wid: number;
  cid: number;
  name: string;
  billable: boolean;
  is_private: boolean;
  active: boolean;
  // ID of the color selected for the project:
  color: string;
  hex_color: string;
  at: string;
  // Whether the estimated hours are automatically calculated based on task
  //estimations or manually fixed based on the value of 'estimated_hours':
  auto_estimates?: boolean;
  // If auto_estimates is true then the sum of task estimations is returned,
  // otherwise user inserted hours:
  estimated_hours?: number;
  // Hourly rate of the project (float, not required, premium functionality):
  rate?: number;
  // Whether the project can be used as a template
  template?: boolean;
  // ID of the template project used on current project's creation:
  template_id?: number;
}

interface TogglProjectUserResponse {
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
 */
export function* createTogglProjectsSaga(
  sourceProjects: Project[],
): SagaIterator<Project[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceProjects,
    apiCreateFunc: createTogglProject,
  });
}

/**
 * Deletes all specified source projects from Toggl.
 */
export function* deleteTogglProjectsSaga(
  sourceProjects: Project[],
): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceProjects,
    apiDeleteFunc: deleteTogglProject,
  });
}

/**
 * Fetches all projects in Toggl workspaces, adds associated user IDs, and
 * returns array of transformed projects.
 */
export function* fetchTogglProjectsSaga(): SagaIterator<Project[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglProjectsInWorkspace,
  });
}

/**
 * Creates a new Toggl project.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/projects.md#create-project
 */
function* createTogglProject(
  sourceProject: Project,
  targetWorkspaceId: string,
): SagaIterator<Project> {
  const clientIdToLinkedId = yield select(clientIdToLinkedIdSelector);

  const targetClientId = propOr<string | null, Dictionary<string>, string>(
    null,
    sourceProject.clientId ?? "",
    clientIdToLinkedId,
  );

  const projectRequest = {
    project: {
      name: sourceProject.name,
      wid: +targetWorkspaceId,
      cid: isNil(targetClientId) ? undefined : +targetClientId,
      is_private: !sourceProject.isPublic,
    },
  };

  const { data } = yield call(fetchObject, "/toggl/api/projects", {
    method: "POST",
    body: projectRequest,
  });

  return transformFromResponse(data, []);
}

/**
 * Deletes the specified Toggl project.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/projects.md#delete-a-project
 */
function* deleteTogglProject(sourceProject: Project): SagaIterator {
  yield call(fetchEmpty, `/toggl/api/projects/${sourceProject.id}`, {
    method: "DELETE",
  });
}

/**
 * Fetches Toggl projects in the specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-projects
 */
function* fetchTogglProjectsInWorkspace(
  workspaceId: string,
): SagaIterator<Project[]> {
  const allTogglProjects: Project[] = [];

  const togglApiDelay = yield call(getApiDelayForTool, ToolName.Toggl);

  const togglProjects: TogglProjectResponse[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/projects?active=both`,
  );

  for (const togglProject of togglProjects) {
    const projectId = validStringify(togglProject?.id, "");

    const userIds: string[] = yield call(fetchUserIdsInProject, projectId);

    allTogglProjects.push(transformFromResponse(togglProject, userIds));

    yield delay(togglApiDelay);
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
  const projectUsers: TogglProjectUserResponse[] = yield call(
    fetchArray,
    `/toggl/api/projects/${projectId}/project_users`,
  );

  return projectUsers.map(({ uid }) => validStringify(uid, ""));
}

function transformFromResponse(
  project: TogglProjectResponse,
  userIds: string[],
): Project {
  return {
    id: project.id.toString(),
    name: project.name,
    workspaceId: project.wid.toString(),
    clientId: validStringify(project?.cid, null),
    isBillable: project.billable,
    isPublic: !project.is_private,
    isActive: project.active,
    color: project.hex_color,
    estimate: {
      estimate: project?.estimated_hours ?? 0,
      type: project?.auto_estimates ? "AUTO" : "MANUAL",
    },
    userIds,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Projects,
  };
}
