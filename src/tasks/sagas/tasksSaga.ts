import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectTransferMapping } from "~/app/appSelectors";
import { createTasks, fetchTasks } from "~/tasks/tasksActions";
import { selectSourceTasksForTransfer } from "~/tasks/tasksSelectors";
import {
  createClockifyTasksSaga,
  fetchClockifyTasksSaga,
} from "./clockifyTasksSagas";
import { createTogglTasksSaga, fetchTogglTasksSaga } from "./togglTasksSagas";
import { ToolName } from "~/common/commonTypes";
import { TaskModel } from "~/tasks/tasksTypes";

export function* tasksSaga(): SagaIterator {
  yield all([
    takeEvery(createTasks.request, createTasksSaga),
    takeEvery(fetchTasks.request, fetchTasksSaga),
  ]);
}

function* createTasksSaga(): SagaIterator {
  try {
    const sourceTasks = yield select(selectSourceTasksForTransfer);
    const transferMapping = yield select(selectTransferMapping);

    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyTasksSaga,
      [ToolName.Toggl]: createTogglTasksSaga,
    }[transferMapping.target];

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

function* fetchTasksSaga(): SagaIterator {
  try {
    const { source, target } = yield select(selectTransferMapping);

    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyTasksSaga,
      [ToolName.Toggl]: fetchTogglTasksSaga,
    };
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
