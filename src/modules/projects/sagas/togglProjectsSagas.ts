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

interface TogglRecurringParametersItem {
  custom_period: number;
  estimated_seconds: number;
  parameter_end_date: string;
  parameter_start_date: string;
  period: string;
  project_start_date: string;
}

/**
 * Response from Toggl API for projects.
 * @see https://developers.track.toggl.com/docs/api/projects#response-5
 */
interface TogglProjectResponse {
  id: number;
  workspace_id: number;
  client_id: number;
  name: string;
  is_private: boolean;
  active: boolean;
  at: string;
  created_at: string;
  server_deleted_at: string | null;
  color: string;
  billable: boolean | null;
  template: boolean | null;
  auto_estimates: boolean | null;
  estimated_hours: number | null;
  rate: number | null;
  rate_last_updated: string | null;
  currency: string | null;
  recurring: boolean;
  recurring_parameters: { items: TogglRecurringParametersItem[] } | null;
  current_period: { end_date: string; start_date: string } | null;
  fixed_fee: number | null;
  actual_hours: number;
}

/**
 * Response from Toggl API for projects users.
 * @see https://developers.track.toggl.com/docs/api/projects#response
 */
interface TogglProjectUserResponse {
  id: number;
  project_id: number;
  user_id: number;
  workspace_id: number;
  manager: boolean;
  rate: number | null;
  rate_last_updated: string | null;
  at: string;
  group_id: number | null;
  labour_cost: number | null;
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
 * @see https://developers.track.toggl.com/docs/api/projects#post-workspaceprojects
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

  const body: RequestBody = {
    name: sourceProject.name,
    is_private: !sourceProject.isPublic,
  };

  if (!isNil(targetClientId)) {
    body.client_id = +targetClientId;
  }

  if (sourceProject.color?.startsWith("#")) {
    body.color = sourceProject.color;
  }

  const togglProject = yield call(
    fetchObject,
    `/toggl/api/workspaces/${targetWorkspaceId}/projects`,
    {
      method: "POST",
      body,
    },
  );

  return transformFromResponse(togglProject, []);
}

/**
 * Deletes the specified Toggl project.
 * @see https://developers.track.toggl.com/docs/api/projects#delete-workspaceproject
 */
function* deleteTogglProject(sourceProject: Project): SagaIterator {
  const { id, workspaceId } = sourceProject;

  yield call(
    fetchEmpty,
    `/toggl/api/workspaces/${workspaceId}/projects/${id}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * Fetches Toggl projects in the specified workspace.
 * @see https://developers.track.toggl.com/docs/api/projects#get-workspaceprojects
 */
function* fetchTogglProjectsInWorkspace(
  workspaceId: string,
): SagaIterator<Project[]> {
  const allTogglProjects: Project[] = [];

  const togglApiDelay = yield call(getApiDelayForTool, ToolName.Toggl);

  const activeTogglProjects: TogglProjectResponse[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/projects?active=true`,
  );

  const inactiveTogglProjects: TogglProjectResponse[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/projects?active=false`,
  );

  const togglProjects = [...activeTogglProjects, ...inactiveTogglProjects];

  const usersInProjectsMap = yield call(
    fetchProjectUsersInWorkspace,
    workspaceId,
  );

  for (const togglProject of togglProjects) {
    const projectId = validStringify(togglProject?.id, "");

    const userIds: string[] = usersInProjectsMap.get(projectId) ?? [];

    allTogglProjects.push(transformFromResponse(togglProject, userIds));

    yield delay(togglApiDelay);
  }

  return allTogglProjects;
}

/**
 * Fetches the users associated with a specific project and returns an array
 * of strings that represents the user ID.
 * @see https://developers.track.toggl.com/docs/api/projects#get-get-workspace-projects-users
 */
function* fetchProjectUsersInWorkspace(
  workspaceId: string,
): SagaIterator<Map<string, string[]>> {
  const projectUsers: TogglProjectUserResponse[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/project_users`,
  );

  const usersInProjectsMap = new Map<string, string[]>();

  for (const projectUser of projectUsers) {
    const { project_id, user_id } = projectUser;

    const projectIdString = project_id.toString();

    const usersInProject = usersInProjectsMap.get(projectIdString) ?? [];

    usersInProject.push(user_id.toString());

    usersInProjectsMap.set(projectIdString, usersInProject);
  }

  return usersInProjectsMap;
}

function transformFromResponse(
  project: TogglProjectResponse,
  userIds: string[],
): Project {
  return {
    id: project.id.toString(),
    name: project.name,
    workspaceId: project.workspace_id.toString(),
    clientId: validStringify(project?.client_id, null),
    isBillable: project.billable ?? false,
    isPublic: !project.is_private,
    isActive: project.active,
    color: project.color,
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
