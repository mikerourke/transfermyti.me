import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, delay, select } from "redux-saga/effects";
import { CLOCKIFY_API_DELAY } from "~/constants";
import * as reduxUtils from "~/redux/reduxUtils";
import { clientIdToLinkedIdSelector } from "~/clients/clientsSelectors";
import {
  ClockifyHourlyRateResponseModel,
  ClockifyMembershipResponseModel,
  ClockifyUserResponseModel,
} from "~/users/sagas/clockifyUsersSagas";
import { EntityGroup, EstimateModel, ProjectModel, ToolName } from "~/typeDefs";

export interface ClockifyProjectResponseModel {
  archived: boolean;
  billable: boolean;
  clientId: string;
  clientName: string;
  color: string;
  duration: string;
  estimate: EstimateModel;
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
 */
export function* createClockifyProjectsSaga(
  sourceProjects: ProjectModel[],
): SagaIterator<ProjectModel[]> {
  return yield call(reduxUtils.createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceProjects,
    apiCreateFunc: createClockifyProject,
  });
}

/**
 * Deletes all specified source projects from Clockify.
 */
export function* deleteClockifyProjectsSaga(
  sourceProjects: ProjectModel[],
): SagaIterator {
  yield call(reduxUtils.deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceProjects,
    apiDeleteFunc: deleteClockifyProject,
  });
}

/**
 * Fetches all projects in Clockify workspaces, adds associated user IDs, and
 * returns array of transformed projects.
 */
export function* fetchClockifyProjectsSaga(): SagaIterator<ProjectModel[]> {
  return yield call(reduxUtils.fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyProjectsInWorkspace,
  });
}

/**
 * Creates a new Clockify project.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-post
 */
function* createClockifyProject(
  sourceProject: ProjectModel,
  targetWorkspaceId: string,
): SagaIterator<ProjectModel> {
  const clientIdToLinkedId = yield select(clientIdToLinkedIdSelector);
  const targetClientId = R.propOr<
    string | null,
    Record<string, string>,
    string
  >(null, sourceProject.clientId ?? "", clientIdToLinkedId);

  const estimateHours = R.pathOr(0, ["estimate", "estimate"], sourceProject);
  const estimateType = R.pathOr("AUTO", ["estimate", "type"], sourceProject);

  const projectRequest = {
    name: sourceProject.name,
    clientId: R.isNil(targetClientId) ? undefined : targetClientId,
    isPublic: sourceProject.isPublic,
    estimate: {
      estimate: estimateHours.toString(),
      type: estimateType,
    },
    color: sourceProject.color,
    billable: sourceProject.isBillable,
  };

  const clockifyProject = yield call(
    reduxUtils.fetchObject,
    `/clockify/api/v1/workspaces/${targetWorkspaceId}/projects`,
    { method: "POST", body: projectRequest },
  );

  return transformFromResponse(clockifyProject, []);
}

/**
 * Deletes the specified Clockify project.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects--id--delete
 */
function* deleteClockifyProject(sourceProject: ProjectModel): SagaIterator {
  const { workspaceId, id } = sourceProject;
  yield call(
    reduxUtils.fetchObject,
    `/clockify/api/v1/workspaces/${workspaceId}/projects/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify projects in specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-get
 */
function* fetchClockifyProjectsInWorkspace(
  workspaceId: string,
): SagaIterator<ProjectModel[]> {
  const allClockifyProjects: ProjectModel[] = [];

  const clockifyProjects: ClockifyProjectResponseModel[] = yield call(
    reduxUtils.fetchPaginatedFromClockify,
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
 * @deprecated This is part of the old API and will need to be updated as soon
 *             as the v1 endpoint is available.
 */
function* fetchUserIdsInProject(
  workspaceId: string,
  projectId: string,
): SagaIterator<string[]> {
  const projectUsers: ClockifyUserResponseModel[] = yield call(
    reduxUtils.fetchArray,
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
    estimate: {
      estimate: project?.estimate?.estimate ?? 0,
      type: project?.estimate?.type ?? "AUTO",
    },
    userIds,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Projects,
  };
}
