import { call, delay, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import {
  incrementTransferCounts,
  paginatedClockifyFetch,
  startGroupTransfer,
} from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import {
  createClockifyProjects,
  fetchClockifyProjects,
} from "~/projects/projectsActions";
import { selectTargetProjectsForTransfer } from "~/projects/projectsSelectors";
import {
  ClockifyHourlyRateResponseModel,
  ClockifyMembershipResponseModel,
  ClockifyUserResponseModel,
} from "~/users/sagas/clockifyUsersSaga";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
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

export function* createClockifyProjectsSaga(
  action: ActionType<typeof createClockifyProjects.request>,
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
      yield call(createClockifyProject, workspaceId, newProject);
      yield delay(500);
    }

    yield put(createClockifyProjects.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createClockifyProjects.failure());
  }
}

/**
 * Fetches all projects in Clockify workspace, adds associated user IDs, and
 * updates state with result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-get
 */
export function* fetchClockifyProjectsSaga(
  action: ActionType<typeof fetchClockifyProjects.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const clockifyProjects: ClockifyProjectResponseModel[] = yield call(
      paginatedClockifyFetch,
      `/clockify/api/v1/workspaces/${workspaceId}/projects`,
    );

    const recordsById: Record<string, ProjectModel> = {};

    for (const clockifyProject of clockifyProjects) {
      const projectId = clockifyProject.id;
      const userIds: string[] = yield call(
        fetchUserIdsInProject,
        workspaceId,
        projectId,
      );
      recordsById[projectId] = transformFromResponse(
        clockifyProject,
        workspaceId,
        userIds,
      );
      yield delay(500);
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Clockify);

    yield put(fetchClockifyProjects.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClockifyProjects.failure());
  }
}

/**
 * Creates a Clockify project and returns the response as { [New Project] }.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects-post
 */
function* createClockifyProject(
  workspaceId: string,
  project: ProjectModel,
): SagaIterator {
  const projectRequest = transformToRequest(project);
  yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${workspaceId}/projects`,
    { method: HttpMethod.Post, body: projectRequest },
  );
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
