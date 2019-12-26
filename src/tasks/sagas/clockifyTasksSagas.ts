import { call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { fetchObject } from "~/utils";
import {
  paginatedClockifyFetch,
  fetchEntitiesForTool,
  createEntitiesForTool,
} from "~/redux/sagaUtils";
import { EntityGroup, HttpMethod, ToolName } from "~/common/commonTypes";
import { TaskModel } from "~/tasks/tasksTypes";

type ClockifyTaskStatus = "ACTIVE" | "DONE";

export interface ClockifyTaskResponseModel {
  assigneeIds: string[] | null;
  estimate: string;
  id: string;
  name: string;
  projectId: string;
  status: ClockifyTaskStatus;
}

interface ClockifyTaskRequestModel {
  name: string;
  projectId: string;
  assigneeIds?: string[];
  estimate?: string;
  status?: ClockifyTaskStatus;
}

export function* createClockifyTasksSaga(
  sourceTasks: TaskModel[],
): SagaIterator {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTasks,
    creatorFunc: createClockifyTask,
  });
}

/**
 * Fetches all tasks in Clockify workspace and returns result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-get
 */
export function* fetchClockifyTasksSaga(): SagaIterator {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    fetchFunc: fetchClockifyTasksInWorkspace,
  });
}

/**
 * Creates a Clockify task and returns the response as { [New Task] }.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-post
 */
function* createClockifyTask(
  sourceTask: TaskModel,
  workspaceId: string,
): SagaIterator {
  const taskRequest = transformToRequest(sourceTask);
  const targetTask = yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${workspaceId}/tasks`,
    {
      method: HttpMethod.Post,
      body: taskRequest,
    },
  );

  return transformFromResponse(targetTask, workspaceId);
}

function* fetchClockifyTasksInWorkspace(
  workspaceId: string,
): SagaIterator<TaskModel[]> {
  const clockifyTasks: ClockifyTaskResponseModel[] = yield call(
    paginatedClockifyFetch,
    `/clockify/api/v1/workspaces/${workspaceId}/tasks`,
  );

  return clockifyTasks.map(clockifyTask =>
    transformFromResponse(clockifyTask, workspaceId),
  );
}

function transformToRequest(task: TaskModel): ClockifyTaskRequestModel {
  return {
    name: task.name,
    projectId: task.projectId,
    assigneeIds: task.assigneeIds || undefined,
    estimate: task.estimate,
    status: task.isActive ? "ACTIVE" : "DONE",
  };
}

function transformFromResponse(
  task: ClockifyTaskResponseModel,
  workspaceId: string,
): TaskModel {
  return {
    id: task.id,
    name: task.name,
    estimate: task.estimate,
    projectId: task.projectId,
    assigneeIds: task.assigneeIds,
    isActive: task.status === "ACTIVE",
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tasks,
  };
}
