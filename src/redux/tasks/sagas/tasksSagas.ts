import { indexBy, pathOr, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/api/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/redux/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/redux/app/appActions";
import { isProjectIncludedUpdated } from "~/redux/projects/projectsActions";
import { sourceProjectsSelector } from "~/redux/projects/projectsSelectors";
import { isActionOf, type ActionType } from "~/redux/reduxTools";
import * as clockifySagas from "~/redux/tasks/sagas/clockifyTasksSagas";
import * as togglSagas from "~/redux/tasks/sagas/togglTasksSagas";
import * as tasksActions from "~/redux/tasks/tasksActions";
import {
  includedSourceTasksCountSelector,
  includedSourceTasksSelector,
  sourceTasksByIdSelector,
  sourceTasksForTransferSelector,
} from "~/redux/tasks/tasksSelectors";
import {
  Mapping,
  ToolAction,
  ToolName,
  type Project,
  type Task,
} from "~/types";

export function* taskMonitoringSaga(): SagaIterator {
  yield all([
    takeEvery(
      [
        tasksActions.isTaskIncludedToggled,
        tasksActions.areAllTasksIncludedUpdated,
      ],
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
  action: ActionType<typeof tasksActions>,
): SagaIterator {
  const toolAction = yield select(toolActionSelector);
  // The user can _delete_ tasks from a project without actually deleting the
  // project, so we don't want to push the changes up to the parent project:
  if (toolAction === ToolAction.Delete) {
    return;
  }

  const sourceProjects: Project[] = yield select(sourceProjectsSelector);

  const includedSourceTasksCount = yield select(
    includedSourceTasksCountSelector,
  );

  const sourceTasksById = yield select(sourceTasksByIdSelector);

  if (isActionOf(tasksActions.isTaskIncludedToggled, action)) {
    const sourceProjectId = pathOr<string>(
      "",
      [action.payload, "projectId"],
      sourceTasksById,
    );

    yield put(
      isProjectIncludedUpdated({
        id: sourceProjectId,
        isIncluded: includedSourceTasksCount > 0,
      }),
    );

    return;
  }

  if (isActionOf(tasksActions.areAllTasksIncludedUpdated, action)) {
    if (includedSourceTasksCount === 0) {
      return;
    }

    for (const sourceProject of sourceProjects) {
      yield put(
        isProjectIncludedUpdated({
          id: sourceProject.id,
          isIncluded: true,
        }),
      );
    }
  }
}

/**
 * Creates tasks in the target tool based on the included tasks from the
 * source tool and links them by ID.
 */
export function* createTasksSaga(): SagaIterator {
  yield put(tasksActions.createTasks.request());

  try {
    const { target } = yield select(toolNameByMappingSelector);

    const createSagaForTargetTool =
      target === ToolName.Clockify
        ? clockifySagas.createClockifyTasksSaga
        : togglSagas.createTogglTasksSaga;

    const sourceTasks = yield select(sourceTasksForTransferSelector);

    const targetTasks = yield call(createSagaForTargetTool, sourceTasks);

    const tasksByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceTasks,
      targetTasks,
    );

    yield put(tasksActions.createTasks.success(tasksByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(tasksActions.createTasks.failure());
  }
}

/**
 * Deletes included tasks from the source tool.
 */
export function* deleteTasksSaga(): SagaIterator {
  yield put(tasksActions.deleteTasks.request());

  try {
    const { source } = yield select(toolNameByMappingSelector);

    const deleteSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.deleteClockifyTasksSaga
        : togglSagas.deleteTogglTasksSaga;

    const sourceTasks = yield select(includedSourceTasksSelector);

    yield call(deleteSagaForSourceTool, sourceTasks);

    yield put(tasksActions.deleteTasks.success());
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(tasksActions.deleteTasks.failure());
  }
}

/**
 * Fetches tasks from the source and target tools and links them by ID.
 */
export function* fetchTasksSaga(): SagaIterator {
  yield put(tasksActions.fetchTasks.request());

  try {
    const { source, target } = yield select(toolNameByMappingSelector);

    const fetchSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.fetchClockifyTasksSaga
        : togglSagas.fetchTogglTasksSaga;

    const sourceTasks = yield call(fetchSagaForSourceTool);

    const toolAction = yield select(toolActionSelector);

    let tasksByIdByMapping: Record<Mapping, Dictionary<Task>>;

    if (toolAction === ToolAction.Transfer) {
      const fetchSagaForTargetTool =
        target === ToolName.Clockify
          ? clockifySagas.fetchClockifyTasksSaga
          : togglSagas.fetchTogglTasksSaga;

      const targetTasks = yield call(fetchSagaForTargetTool);

      tasksByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceTasks,
        targetTasks,
      );
    } else {
      tasksByIdByMapping = {
        source: indexBy(prop("id"), sourceTasks),
        target: {},
      };
    }

    yield put(tasksActions.fetchTasks.success(tasksByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(tasksActions.fetchTasks.failure());
  }
}
