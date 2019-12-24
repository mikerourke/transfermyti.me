import { call, put, select, delay } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import {
  incrementTransferCounts,
  paginatedClockifyFetch,
  startGroupTransfer,
} from "~/redux/sagaUtils";
import { fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import { createClockifyTasks, fetchClockifyTasks } from "~/tasks/tasksActions";
import { selectTargetTasksForTransfer } from "~/tasks/tasksSelectors";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
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
  action: ActionType<typeof createClockifyTasks.request>,
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
      yield call(createClockifyTask, workspaceId, task);
      yield delay(500);
    }

    yield put(createClockifyTasks.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createClockifyTasks.failure());
  }
}

/**
 * Fetches all tasks in Clockify workspace and updates state with result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-get
 */
export function* fetchClockifyTasksSaga(
  action: ActionType<typeof fetchClockifyTasks.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const clockifyTasks: ClockifyTaskResponseModel[] = yield call(
      paginatedClockifyFetch,
      `/clockify/api/v1/workspaces/${workspaceId}/tasks`,
    );

    const recordsById: Record<string, TaskModel> = {};

    for (const clockifyTask of clockifyTasks) {
      recordsById[clockifyTask.id] = transformFromResponse(
        clockifyTask,
        workspaceId,
      );
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Clockify);

    yield put(fetchClockifyTasks.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClockifyTasks.failure());
  }
}

/**
 * Creates a Clockify task and returns the response as { [New Task] }.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tasks-post
 */
function* createClockifyTask(
  workspaceId: string,
  task: TaskModel,
): SagaIterator {
  const taskRequest = transformToRequest(task);
  yield call(fetchObject, `/clockify/api/v1/workspaces/${workspaceId}/tasks`, {
    method: HttpMethod.Post,
    body: taskRequest,
  });
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
