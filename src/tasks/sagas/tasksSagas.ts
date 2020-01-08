import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { isActionOf } from "typesafe-actions";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/app/appSelectors";
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
import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";
import { ToolAction } from "~/app/appTypes";
import { ProjectModel } from "~/projects/projectsTypes";
import { ReduxAction } from "~/redux/reduxTypes";
import { TaskModel, TasksByIdModel } from "~/tasks/tasksTypes";

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
  const toolAction = yield select(toolActionSelector);
  if (toolAction === ToolAction.Delete) {
    return;
  }

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

    const toolAction = yield select(toolActionSelector);
    let tasksByIdByMapping: Record<Mapping, TasksByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      const targetTasks = yield call(fetchSagaByToolName[target]);

      tasksByIdByMapping = linkEntitiesByIdByMapping<TaskModel>(
        sourceTasks,
        targetTasks,
      );
    } else {
      tasksByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceTasks),
        target: {},
      };
    }

    yield put(tasksActions.fetchTasks.success(tasksByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(tasksActions.fetchTasks.failure());
  }
}
