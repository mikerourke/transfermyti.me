import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { isActionOf } from "typesafe-actions";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/allEntities/allEntitiesSelectors";
import { showFetchErrorNotification } from "~/app/appActions";
import { updateIsProjectIncluded } from "~/projects/projectsActions";
import { sourceProjectsSelector } from "~/projects/projectsSelectors";
import * as tasksActions from "~/tasks/tasksActions";
import {
  includedSourceTasksCountSelector,
  includedSourceTasksSelector,
  sourceTasksByIdSelector,
  sourceTasksForTransferSelector,
} from "~/tasks/tasksSelectors";
import * as clockifySagas from "./clockifyTasksSagas";
import * as togglSagas from "./togglTasksSagas";
import {
  Mapping,
  ProjectModel,
  ReduxAction,
  TasksByIdModel,
  ToolAction,
  ToolName,
} from "~/typeDefs";

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

/**
 * Pushes task inclusion changes up to the corresponding project. A task cannot
 * be created in a target project if the target project is not included in a
 * transfer.
 */
function* pushTaskInclusionChangesToProject(
  action: ReduxAction<string | boolean>,
): SagaIterator {
  const toolAction = yield select(toolActionSelector);
  // The user can _delete_ tasks from a project without actually deleting the
  // project, so we don't want to push the changes up to the parent project:
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

/**
 * Creates tasks in the target tool based on the included tasks from the
 * source tool and links them by ID.
 */
export function* createTasksSaga(): SagaIterator {
  yield put(tasksActions.createTasks.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.createClockifyTasksSaga,
      [ToolName.Toggl]: togglSagas.createTogglTasksSaga,
    }[toolNameByMapping.target];

    const sourceTasks = yield select(sourceTasksForTransferSelector);
    const targetTasks = yield call(createSagaByToolName, sourceTasks);
    const tasksByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceTasks,
      targetTasks,
    );

    yield put(tasksActions.createTasks.success(tasksByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(tasksActions.createTasks.failure());
  }
}

/**
 * Deletes included tasks from the source tool.
 */
export function* deleteTasksSaga(): SagaIterator {
  yield put(tasksActions.deleteTasks.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const deleteSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.deleteClockifyTasksSaga,
      [ToolName.Toggl]: togglSagas.deleteTogglTasksSaga,
    }[toolNameByMapping.source];

    const sourceTasks = yield select(includedSourceTasksSelector);
    yield call(deleteSagaByToolName, sourceTasks);

    yield put(tasksActions.deleteTasks.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(tasksActions.deleteTasks.failure());
  }
}

/**
 * Fetches tasks from the source and target tools and links them by ID.
 */
export function* fetchTasksSaga(): SagaIterator {
  yield put(tasksActions.fetchTasks.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyTasksSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglTasksSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceTasks = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);
    let tasksByIdByMapping: Record<Mapping, TasksByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      const targetTasks = yield call(fetchSagaByToolName[target]);

      tasksByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
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
