import { isNil, pathOr, propOr } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, delay, select } from "redux-saga/effects";

import {
  fetchObject,
  fetchPaginatedFromClockify,
  getApiDelayForTool,
} from "~/api/apiRequests";
import { createEntitiesForTool } from "~/api/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/api/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/api/fetchEntitiesForTool";
import { clientIdToLinkedIdSelector } from "~/redux/clients/clientsSelectors";
import type {
  ClockifyMembershipResponse,
  ClockifyRateResponse,
} from "~/redux/users/sagas/clockifyUsersSagas";
import { EntityGroup, ToolName, type Estimate, type Project } from "~/types";

type ClockifyTimeEstimateResponse = {
  active: boolean;
  estimate: string;
  includeNonBillable: boolean;
  resetOption: string | null;
  type: "AUTO" | "MANUAL";
};

type ClockifyBudgetEstimateResponse = {
  active: boolean;
  estimate: string;
  includeExpenses: boolean;
  includesBillableExpenses: boolean;
  resetOption: string | null;
  type: "AUTO" | "MANUAL";
};

export type ClockifyProjectResponse = {
  archived: boolean;
  billable: boolean;
  budgetEstimate: ClockifyBudgetEstimateResponse | null;
  clientId: string;
  clientName: string;
  color: string;
  costRate: ClockifyRateResponse | null;
  duration: string;
  estimate: Estimate;
  hourlyRate: ClockifyRateResponse;
  id: string;
  memberships?: ClockifyMembershipResponse[];
  name: string;
  note: string;
  public: boolean;
  template: boolean;
  timeEstimate: ClockifyTimeEstimateResponse;
  workspaceId: string;
};

/**
 * Creates new Clockify projects in all target workspaces and returns array of
 * transformed projects.
 */
export function* createClockifyProjectsSaga(
  sourceProjects: Project[],
): SagaIterator<Project[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceProjects,
    apiCreateFunc: createClockifyProject,
  });
}

/**
 * Deletes all specified source projects from Clockify.
 */
export function* deleteClockifyProjectsSaga(
  sourceProjects: Project[],
): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceProjects,
    apiDeleteFunc: deleteClockifyProject,
  });
}

/**
 * Fetches all projects in Clockify workspaces, adds associated user IDs, and
 * returns array of transformed projects.
 */
export function* fetchClockifyProjectsSaga(): SagaIterator<Project[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyProjectsInWorkspace,
  });
}

/**
 * Creates a new Clockify project.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-post
 */
function* createClockifyProject(
  sourceProject: Project,
  targetWorkspaceId: string,
): SagaIterator<Project> {
  const clientIdToLinkedId = yield select(clientIdToLinkedIdSelector);

  const targetClientId = propOr<string | null, Dictionary<string>, string>(
    null,
    sourceProject.clientId ?? "",
    clientIdToLinkedId,
  );

  const estimateHours = pathOr(0, ["estimate", "estimate"], sourceProject);

  const estimateType = pathOr("AUTO", ["estimate", "type"], sourceProject);

  const body = {
    name: sourceProject.name,
    clientId: isNil(targetClientId) ? undefined : targetClientId,
    isPublic: sourceProject.isPublic,
    estimate: {
      estimate: +estimateHours,
      type: estimateType,
    },
    color: sourceProject.color,
    billable: sourceProject.isBillable,
  };

  const clockifyProject = yield call(
    fetchObject,
    `/clockify/api/workspaces/${targetWorkspaceId}/projects`,
    { method: "POST", body },
  );

  return transformFromResponse(clockifyProject, []);
}

/**
 * Deletes the specified Clockify project.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects--id--delete
 */
function* deleteClockifyProject(sourceProject: Project): SagaIterator {
  const { workspaceId, id } = sourceProject;

  // Need to set a project to "archived" before it can be deleted:
  yield call(
    fetchObject,
    `/clockify/api/workspaces/${workspaceId}/projects/${id}`,
    {
      method: "PUT",
      body: {
        ...sourceProject,
        archived: true,
      },
    },
  );

  yield call(
    fetchObject,
    `/clockify/api/workspaces/${workspaceId}/projects/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify projects in specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-get
 */
function* fetchClockifyProjectsInWorkspace(
  workspaceId: string,
): SagaIterator<Project[]> {
  const allClockifyProjects: Project[] = [];

  const clockifyApiDelay = yield call(getApiDelayForTool, ToolName.Clockify);

  const clockifyProjects: ClockifyProjectResponse[] = yield call(
    fetchPaginatedFromClockify,
    `/clockify/api/workspaces/${workspaceId}/projects`,
  );

  for (const clockifyProject of clockifyProjects) {
    const memberships = clockifyProject?.memberships ?? [];

    const userIds: string[] = memberships
      .map((membership) => {
        if (
          membership.membershipType === "PROJECT" &&
          membership.membershipStatus === "ACTIVE"
        ) {
          return membership.userId;
        } else {
          return "";
        }
      })
      .filter(Boolean);

    allClockifyProjects.push(transformFromResponse(clockifyProject, userIds));

    yield delay(clockifyApiDelay);
  }

  return allClockifyProjects;
}

function transformFromResponse(
  project: ClockifyProjectResponse,
  userIds: string[],
): Project {
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
