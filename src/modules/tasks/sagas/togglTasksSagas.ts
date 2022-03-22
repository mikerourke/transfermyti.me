import * as R from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";

import {
  fetchArray,
  fetchEmpty,
  fetchObject,
} from "~/entityOperations/apiRequests";
import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { projectIdToLinkedIdSelector } from "~/modules/projects/projectsSelectors";
import { EntityGroup, ToolName, type TaskModel } from "~/typeDefs";
import { validStringify } from "~/utilities/textTransforms";

interface TogglTaskResponseModel {
  name: string;
  id: number;
  wid: number;
  pid: number;
  uid?: number;
  active: boolean;
  at: string;
  estimated_seconds: number;
}

/**
 * Creates new Toggl tasks that correspond to source and returns array of
 * transformed tasks.
 */
export function* createTogglTasksSaga(sourceTasks: TaskModel[]): SagaIterator {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTasks,
    apiCreateFunc: createTogglTask,
  });
}

/**
 * Deletes all specified source tasks from Toggl.
 */
export function* deleteTogglTasksSaga(sourceTasks: TaskModel[]): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTasks,
    apiDeleteFunc: deleteTogglTask,
  });
}

/**
 * Fetches all tasks in Toggl workspaces and returns the result.
 */
export function* fetchTogglTasksSaga(): SagaIterator<TaskModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglTasksInWorkspace,
  });
}

/**
 * Creates a new Toggl task.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tasks.md#create-a-task
 */
function* createTogglTask(sourceTask: TaskModel): SagaIterator<TaskModel> {
  const projectIdToLinkedId = yield select(projectIdToLinkedIdSelector);
  const targetProjectId = R.propOr<
    string | null,
    Record<string, string>,
    string
  >(null, sourceTask.projectId, projectIdToLinkedId);

  if (R.isNil(targetProjectId)) {
    throw new Error(
      `Could not find target project ID for Toggl task ${sourceTask.name}`,
    );
  }

  const taskRequest = {
    task: {
      name: sourceTask.name,
      pid: +targetProjectId,
    },
  };

  const { data } = yield call(fetchObject, "/toggl/api/tasks", {
    method: "POST",
    body: taskRequest,
  });

  return transformFromResponse(data);
}

/**
 * Deletes the specified Toggl task.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tasks.md#delete-a-task
 */
function* deleteTogglTask(sourceTask: TaskModel): SagaIterator {
  yield call(fetchEmpty, `/toggl/api/tasks/${sourceTask.id}`, {
    method: "DELETE",
  });
}

/**
 * Fetches Toggl tasks in the specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-tasks
 */
function* fetchTogglTasksInWorkspace(
  workspaceId: string,
): SagaIterator<TaskModel[]> {
  const togglTasks: TogglTaskResponseModel[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/tasks`,
  );

  return togglTasks.map(transformFromResponse);
}

function transformFromResponse(task: TogglTaskResponseModel): TaskModel {
  return {
    id: task.id.toString(),
    name: task.name,
    estimate: convertSecondsToClockifyEstimate(task.estimated_seconds),
    projectId: task.pid.toString(),
    assigneeIds: task.uid ? [validStringify(task?.uid, "")] : [],
    isActive: task.active,
    workspaceId: validStringify(task?.wid, ""),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tasks,
  };
}

function convertSecondsToClockifyEstimate(seconds: number): string {
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `PT${minutes}M`;
  }

  const hours = minutes / 60;
  return `PT${hours}H`;
}
