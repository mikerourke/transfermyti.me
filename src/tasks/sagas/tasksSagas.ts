import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { isActionOf } from "typesafe-actions";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { updateIsProjectIncluded } from "~/projects/projectsActions";
import { sourceProjectsSelector } from "~/projects/projectsSelectors";
import * as tasksActions from "~/tasks/tasksActions";
import {
  includedSourceTasksCountSelector,
  sourceTasksByIdSelector,
  sourceTasksForTransferSelector,
} from "~/tasks/tasksSelectors";
import {
  createClockifyTasksSaga,
  fetchClockifyTasksSaga,
} from "./clockifyTasksSagas";
import { createTogglTasksSaga, fetchTogglTasksSaga } from "./togglTasksSagas";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { ProjectModel } from "~/projects/projectsTypes";
import { ReduxAction } from "~/redux/reduxTypes";
import { TaskModel } from "~/tasks/tasksTypes";

export function* taskMonitoringSaga(): SagaIterator {
  yield all([
    takeEvery(
      tasksActions.flipIsTaskIncluded,
      pushTaskInclusionChangesToProject,
    ),
    takeEvery(
      tasksActions.updateAreAllTasksIncluded,
      pushTaskInclusionChangesToProject,
    ),
  ]);
}

function* pushTaskInclusionChangesToProject(
  action: ReduxAction<string | boolean>,
): SagaIterator {
  const sourceProjects: ProjectModel[] = yield select(sourceProjectsSelector);
  const includedSourceTasksCount = yield select(
    includedSourceTasksCountSelector,
  );
  const sourceTasksById = yield select(sourceTasksByIdSelector);

  switch (true) {
    case isActionOf(tasksActions.flipIsTaskIncluded, action):
      const sourceProjectId = R.pathOr<string>(
        "",
        [action.payload as string, "projectId"],
        sourceTasksById,
      );

      yield put(
        updateIsProjectIncluded({
          id: sourceProjectId,
          isIncluded: includedSourceTasksCount > 0,
        }),
      );
      break;

    case isActionOf(tasksActions.updateAreAllTasksIncluded, action):
      if (includedSourceTasksCount === 0) {
        break;
      }

      for (const sourceProject of sourceProjects) {
        yield put(
          updateIsProjectIncluded({
            id: sourceProject.id,
            isIncluded: true,
          }),
        );
      }
      break;

    default:
      break;
  }
}

export function* createTasksSaga(): SagaIterator {
  yield put(tasksActions.createTasks.request());

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

    yield put(tasksActions.createTasks.success(tasksByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(tasksActions.createTasks.failure());
  }
}

export function* fetchTasksSaga(): SagaIterator {
  yield put(tasksActions.fetchTasks.request());

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

    yield put(tasksActions.fetchTasks.success(tasksByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(tasksActions.fetchTasks.failure());
  }
}
