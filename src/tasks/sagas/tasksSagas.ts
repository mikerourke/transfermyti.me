import { SagaIterator } from "@redux-saga/types";
import { call, put, select } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { createTasks, fetchTasks } from "~/tasks/tasksActions";
import { sourceTasksForTransferSelector } from "~/tasks/tasksSelectors";
import {
  createClockifyTasksSaga,
  fetchClockifyTasksSaga,
} from "./clockifyTasksSagas";
import { createTogglTasksSaga, fetchTogglTasksSaga } from "./togglTasksSagas";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { TaskModel } from "~/tasks/tasksTypes";

export function* createTasksSaga(): SagaIterator {
  yield put(createTasks.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyTasksSaga,
      [ToolName.Toggl]: createTogglTasksSaga,
    }[toolNameByMapping.target];

    const sourceTasks = yield select(sourceTasksForTransferSelector);
    const targetTasks = yield call(createSagaByToolName, sourceTasks);
    const tasksByIdByMapping = linkEntitiesByIdByMapping<TaskModel>(
      sourceTasks,
      targetTasks,
    );

    yield put(createTasks.success(tasksByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTasks.failure());
  }
}

export function* fetchTasksSaga(): SagaIterator {
  yield put(fetchTasks.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyTasksSaga,
      [ToolName.Toggl]: fetchTogglTasksSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceTasks = yield call(fetchSagaByToolName[source]);
    const targetTasks = yield call(fetchSagaByToolName[target]);

    const tasksByIdByMapping = linkEntitiesByIdByMapping<TaskModel>(
      sourceTasks,
      targetTasks,
    );

    yield put(fetchTasks.success(tasksByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTasks.failure());
  }
}