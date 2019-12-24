import { call, put, select, delay } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import { createTogglTasks, fetchTogglTasks } from "~/tasks/tasksActions";
import { selectTargetTasksForTransfer } from "~/tasks/tasksSelectors";
import { TaskModel } from "~/tasks/tasksTypes";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";

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

export function* createTogglTasksSaga(
  action: ActionType<typeof createTogglTasks.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const tasks: TaskModel[] = yield select(
      selectTargetTasksForTransfer,
      workspaceId,
    );
    yield call(startGroupTransfer, EntityGroup.Tasks, tasks.length);

    for (const task of tasks) {
      yield call(incrementTransferCounts);
      yield call(createTogglTask, task);
      yield delay(500);
    }

    yield put(createTogglTasks.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTogglTasks.failure());
  }
}

/**
 * Fetches all tasks in Toggl workspace and updates state with result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-tasks
 */
export function* fetchTogglTasksSaga(
  action: ActionType<typeof fetchTogglTasks.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const togglTasks: TogglTaskResponseModel[] = yield call(
      fetchArray,
      `/toggl/api/workspaces/${workspaceId}/tasks`,
    );

    const recordsById: Record<string, TaskModel> = {};

    for (const togglTask of togglTasks) {
      const taskId = togglTask.id.toString();
      recordsById[taskId] = transformFromResponse(togglTask, workspaceId);
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Toggl);

    yield put(fetchTogglTasks.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTogglTasks.failure());
  }
}

/**
 * Creates a Toggl task and returns the response as { data: [New Task] }.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tasks.md#create-a-task
 */
function* createTogglTask(task: TaskModel): SagaIterator {
  const taskRequest = transformToRequest(task);
  yield call(fetchObject, `/toggl/api/tasks`, {
    method: HttpMethod.Post,
    body: taskRequest,
  });
}

function transformToRequest(task: TaskModel): TogglTaskRequestModel {
  return {
    name: task.name,
    pid: +task.projectId,
  };
}

function transformFromResponse(
  task: TogglTaskResponseModel,
  workspaceId: string,
): TaskModel {
  return {
    id: task.id.toString(),
    name: task.name,
    estimate: convertSecondsToClockifyEstimate(task.estimated_seconds),
    projectId: task.pid.toString(),
    assigneeIds: task.uid ? [task.uid.toString()] : [],
    isActive: task.active,
    workspaceId,
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
