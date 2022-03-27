import { isNil, pathOr, propOr } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, delay, select } from "redux-saga/effects";

import {
  fetchObject,
  fetchPaginatedFromClockify,
  getApiDelayForTool,
} from "~/entityOperations/apiRequests";
import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import {
  projectIdToLinkedIdSelector,
  projectsByWorkspaceIdByToolNameSelector,
} from "~/modules/projects/projectsSelectors";
import { userIdToLinkedIdSelector } from "~/modules/users/usersSelectors";
import { EntityGroup, ToolName, type Task } from "~/typeDefs";

type ClockifyTaskStatus = "ACTIVE" | "DONE";

export interface ClockifyTaskResponse {
  assigneeIds: string[] | null;
  estimate: string;
  id: string;
  name: string;
  projectId: string;
  status: ClockifyTaskStatus;
}

/**
 * Creates new Clockify tasks in all target workspaces and returns array of
 * transformed tasks.
 */
export function* createClockifyTasksSaga(
  sourceTasks: Task[],
): SagaIterator<Task[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTasks,
    apiCreateFunc: createClockifyTask,
  });
}

/**
 * Deletes all specified source tasks from Clockify.
 */
export function* deleteClockifyTasksSaga(sourceTasks: Task[]): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTasks,
    apiDeleteFunc: deleteClockifyTask,
  });
}

/**
 * Fetches all tasks in Clockify workspaces and returns array of transformed
 * tasks.
 */
export function* fetchClockifyTasksSaga(): SagaIterator {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyTasksInWorkspace,
  });
}

/**
 * Creates a new Clockify task.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-post
 */
function* createClockifyTask(
  sourceTask: Task,
  targetWorkspaceId: string,
): SagaIterator<Task> {
  const projectIdToLinkedId = yield select(projectIdToLinkedIdSelector);

  const targetProjectId = propOr<string | null, Record<string, string>, string>(
    null,
    sourceTask.projectId,
    projectIdToLinkedId,
  );

  if (isNil(targetProjectId)) {
    // prettier-ignore
    throw new Error(`Could not find target project ID for Clockify task ${sourceTask.name}`);
  }

  const userIdToLinkedId = yield select(userIdToLinkedIdSelector);

  const targetAssigneeIds: string[] = [];

  for (const sourceAssigneeId of sourceTask.assigneeIds) {
    const assigneeLinkedId = userIdToLinkedId[sourceAssigneeId];

    if (assigneeLinkedId) {
      targetAssigneeIds.push(assigneeLinkedId);
    }
  }

  const taskRequest = {
    name: sourceTask.name,
    projectId: targetProjectId,
    assigneeIds: targetAssigneeIds.length !== 0 ? targetAssigneeIds : undefined,
    estimate: sourceTask.estimate,
    status: sourceTask.isActive ? "ACTIVE" : "DONE",
  };

  const clockifyTask = yield call(
    fetchObject,
    `/clockify/api/workspaces/${targetWorkspaceId}/projects/${targetProjectId}/tasks`,
    { method: "POST", body: taskRequest },
  );

  return transformFromResponse(clockifyTask, targetWorkspaceId);
}

/**
 * Deletes the specified Clockify task.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--projects--projectId--tasks-delete
 */
function* deleteClockifyTask(sourceTask: Task): SagaIterator {
  const { workspaceId, projectId, id } = sourceTask;

  yield call(
    fetchObject,
    `/clockify/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify tasks in all projects in the specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-get
 */
function* fetchClockifyTasksInWorkspace(
  workspaceId: string,
): SagaIterator<Task[]> {
  const projectsByWorkspaceIdByToolName = yield select(
    projectsByWorkspaceIdByToolNameSelector,
  );

  const clockifyProjects = pathOr(
    [],
    [ToolName.Clockify, workspaceId],
    projectsByWorkspaceIdByToolName,
  );

  const clockifyApiDelay = yield call(getApiDelayForTool, ToolName.Clockify);

  const allClockifyTasks: ClockifyTaskResponse[] = [];

  for (const clockifyProject of clockifyProjects) {
    const { id: projectId } = clockifyProject;

    const clockifyTasks: ClockifyTaskResponse[] = yield call(
      fetchPaginatedFromClockify,
      `/clockify/api/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    );

    allClockifyTasks.push(...clockifyTasks);

    yield delay(clockifyApiDelay);
  }

  return allClockifyTasks.map((clockifyTask) =>
    transformFromResponse(clockifyTask, workspaceId),
  );
}

function transformFromResponse(
  task: ClockifyTaskResponse,
  workspaceId: string,
): Task {
  return {
    id: task.id,
    name: task.name,
    estimate: task.estimate,
    projectId: task.projectId,
    assigneeIds: task.assigneeIds ?? [],
    isActive: task.status === "ACTIVE",
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tasks,
  };
}
