import { call, select } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { selectSourceProjectsById } from "~/projects/projectsSelectors";
import { fetchArray, fetchObject } from "~/utils";
import { fetchEntitiesForTool } from "~/redux/sagaUtils";
import { EntityGroup, HttpMethod, ToolName } from "~/common/commonTypes";
import { TaskModel } from "~/tasks/tasksTypes";

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

interface TogglTaskRequestModel {
  name: string;
  pid: number;
}

/**
 * Creates new Toggl tasks that correspond to source and returns an array of
 * transformed tasks.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tasks.md#create-a-task
 */
export function* createTogglTasksSaga(sourceTasks: TaskModel[]): SagaIterator {
  const sourceProjectsById = yield select(selectSourceProjectsById);
  const targetTasks: TaskModel[] = [];

  for (const sourceTask of sourceTasks) {
    const targetProjectId = R.path([
      R.prop("projectId")(sourceTask),
      "linkedId",
    ])(sourceProjectsById) as string;

    if (R.isNil(targetProjectId)) {
      continue;
    }

    const targetTask = yield call(createTogglTask, sourceTask, targetProjectId);
    targetTasks.push(targetTask);
  }

  return targetTasks;
}

/**
 * Fetches all tasks in Toggl workspace and returns the result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-tasks
 */
export function* fetchTogglTasksSaga(): SagaIterator<TaskModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    fetchFunc: fetchTogglTasksInWorkspace,
  });
}

function* createTogglTask(
  sourceTask: TaskModel,
  projectId: string,
): SagaIterator<TaskModel> {
  const taskRequest = transformToRequest(sourceTask, projectId);
  const { data } = yield call(fetchObject, `/toggl/api/tasks`, {
    method: HttpMethod.Post,
    body: taskRequest,
  });

  return transformFromResponse(data);
}

function* fetchTogglTasksInWorkspace(
  workspaceId: string,
): SagaIterator<TaskModel[]> {
  const togglTasks: TogglTaskResponseModel[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/tasks`,
  );

  return togglTasks.map(transformFromResponse);
}

function transformToRequest(
  task: TaskModel,
  projectId: string,
): TogglTaskRequestModel {
  return {
    name: task.name,
    pid: +projectId,
  };
}

function transformFromResponse(task: TogglTaskResponseModel): TaskModel {
  return {
    id: task.id.toString(),
    name: task.name,
    estimate: convertSecondsToClockifyEstimate(task.estimated_seconds),
    projectId: task.pid.toString(),
    assigneeIds: task.uid ? [task.uid.toString()] : [],
    isActive: task.active,
    workspaceId: task.wid.toString(),
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
