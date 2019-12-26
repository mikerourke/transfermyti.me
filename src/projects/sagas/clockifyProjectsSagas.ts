import { call, delay } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { CLOCKIFY_API_DELAY } from "~/constants";
import { fetchArray, fetchObject } from "~/utils";
import {
  paginatedClockifyFetch,
  createEntitiesForTool,
  fetchEntitiesForTool,
} from "~/redux/sagaUtils";
import {
  ClockifyHourlyRateResponseModel,
  ClockifyMembershipResponseModel,
  ClockifyUserResponseModel,
} from "~/users/sagas/clockifyUsersSagas";
import { EntityGroup, HttpMethod, ToolName } from "~/common/commonTypes";
import { ProjectModel } from "~/projects/projectsTypes";

interface ClockifyEstimateModel {
  estimate: number;
  type: "AUTO" | "MANUAL";
}

export interface ClockifyProjectResponseModel {
  archived: boolean;
  billable: boolean;
  clientId: string;
  clientName: string;
  color: string;
  duration: string;
  estimate: ClockifyEstimateModel;
  hourlyRate: ClockifyHourlyRateResponseModel;
  id: string;
  memberships?: ClockifyMembershipResponseModel[];
  name: string;
  public: boolean;
  workspaceId: string;
}

interface ClockifyProjectRequestModel {
  name: string;
  clientId: string;
  isPublic: boolean;
  estimate: ClockifyEstimateModel;
  color: string;
  billable: boolean;
}

/**
 * Creates new Clockify projects in all target workspaces and returns an
 * array of transformed projects.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-post
 */
export function* createClockifyProjectsSaga(
  sourceProjects: ProjectModel[],
): SagaIterator<ProjectModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceProjects,
    creatorFunc: createClockifyProject,
  });
}

/**
 * Fetches all projects in Clockify workspaces, adds associated user IDs, and
 * returns results.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-get
 */
export function* fetchClockifyProjectsSaga(): SagaIterator<ProjectModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    fetchFunc: fetchClockifyProjectsInWorkspace,
  });
}

function* createClockifyProject(
  sourceProject: ProjectModel,
  workspaceId: string,
): SagaIterator<ProjectModel | null> {
  const projectRequest = transformToRequest(sourceProject);
  const targetProject = yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${workspaceId}/projects`,
    { method: HttpMethod.Post, body: projectRequest },
  );

  return transformFromResponse(targetProject, workspaceId, []);
}

function* fetchClockifyProjectsInWorkspace(
  workspaceId: string,
): SagaIterator<ProjectModel[]> {
  const allClockifyProjects: ProjectModel[] = [];

  const clockifyProjects: ClockifyProjectResponseModel[] = yield call(
    paginatedClockifyFetch,
    `/clockify/api/v1/workspaces/${workspaceId}/projects`,
  );
  for (const clockifyProject of clockifyProjects) {
    const projectId = clockifyProject.id;
    const userIds: string[] = yield call(
      fetchUserIdsInProject,
      workspaceId,
      projectId,
    );
    allClockifyProjects.push(
      transformFromResponse(clockifyProject, workspaceId, userIds),
    );

    yield delay(CLOCKIFY_API_DELAY);
  }

  return allClockifyProjects;
}

/**
 * Fetches the users associated with a specific project and returns an array
 * of strings that represents the user ID.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--projects--projectId--users-get
 * @deprecated This is in the "Working API" and will be moved to V1.
 */
function* fetchUserIdsInProject(
  workspaceId: string,
  projectId: string,
): SagaIterator<string[]> {
  const projectUsers: ClockifyUserResponseModel[] = yield call(
    fetchArray,
    `/clockify/api/workspaces/${workspaceId}/projects/${projectId}/users/`,
  );
  return projectUsers.map(({ id }) => id);
}

function transformToRequest(
  project: ProjectModel,
): ClockifyProjectRequestModel {
  return {
    name: project.name,
    clientId: project.clientId,
    isPublic: project.isPublic,
    estimate: {
      estimate: 0,
      type: "AUTO",
    },
    color: project.color,
    billable: project.isBillable,
  };
}

function transformFromResponse(
  project: ClockifyProjectResponseModel,
  workspaceId: string,
  userIds: string[],
): ProjectModel {
  return {
    id: project.id,
    name: project.name,
    workspaceId,
    clientId: project.clientId,
    isBillable: project.billable,
    isPublic: project.public,
    isActive: !project.archived,
    color: project.color,
    userIds,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Projects,
  };
}
