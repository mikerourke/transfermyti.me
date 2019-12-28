import * as R from "ramda";
import { call, delay, select } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { CLOCKIFY_API_DELAY } from "~/constants";
import {
  createEntitiesForTool,
  fetchArray,
  fetchEntitiesForTool,
  fetchObject,
  paginatedClockifyFetch,
} from "~/redux/sagaUtils";
import { selectTargetClientId } from "~/clients/clientsSelectors";
import {
  ClockifyHourlyRateResponseModel,
  ClockifyMembershipResponseModel,
  ClockifyUserResponseModel,
} from "~/users/sagas/clockifyUsersSagas";
import { EntityGroup, ToolName } from "~/entities/entitiesTypes";
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

/**
 * Creates new Clockify projects in all target workspaces and returns array of
 * transformed projects.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-post
 */
export function* createClockifyProjectsSaga(
  sourceProjects: ProjectModel[],
): SagaIterator<ProjectModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceProjects,
    apiCreateFunc: createClockifyProject,
  });
}

/**
 * Fetches all projects in Clockify workspaces, adds associated user IDs, and
 * returns array of transformed projects.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-get
 */
export function* fetchClockifyProjectsSaga(): SagaIterator<ProjectModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyProjectsInWorkspace,
  });
}

function* createClockifyProject(
  sourceProject: ProjectModel,
  targetWorkspaceId: string,
): SagaIterator<ProjectModel> {
  const targetClientId = yield select(
    selectTargetClientId,
    sourceProject.clientId,
  );
  const projectRequest = {
    name: sourceProject.name,
    clientId: R.isNil(targetClientId) ? undefined : targetClientId,
    isPublic: sourceProject.isPublic,
    // TODO: Add project estimate from source (if applicable).
    estimate: {
      estimate: 0,
      type: "AUTO",
    },
    color: sourceProject.color,
    billable: sourceProject.isBillable,
  };

  const clockifyProject = yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${targetWorkspaceId}/projects`,
    { method: "POST", body: projectRequest },
  );

  return transformFromResponse(clockifyProject, []);
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
    allClockifyProjects.push(transformFromResponse(clockifyProject, userIds));

    yield delay(CLOCKIFY_API_DELAY);
  }

  return allClockifyProjects;
}

/**
 * Fetches the users associated with a specific project and returns an array
 * of strings that represents the user IDs.
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

function transformFromResponse(
  project: ClockifyProjectResponseModel,
  userIds: string[],
): ProjectModel {
  return {
    id: project.id,
    name: project.name,
    workspaceId: project.workspaceId,
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
