import { and, indexBy, pathOr, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/api/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/redux/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/redux/app/appActions";
import * as projectActions from "~/redux/projects/projectsActions";
import {
  includedSourceProjectsSelector,
  sourceProjectsByIdSelector,
  sourceProjectsForTransferSelector,
} from "~/redux/projects/projectsSelectors";
import * as clockifySagas from "~/redux/projects/sagas/clockifyProjectsSagas";
import * as togglSagas from "~/redux/projects/sagas/togglProjectsSagas";
import { isActionOf, type ActionType } from "~/redux/reduxTools";
import { isTaskIncludedUpdated } from "~/redux/tasks/tasksActions";
import { sourceTasksSelector } from "~/redux/tasks/tasksSelectors";
import { Mapping, ToolAction, ToolName, type Project } from "~/types";

export function* projectMonitoringSaga(): SagaIterator {
  yield all([
    takeEvery(
      [
        projectActions.isProjectIncludedToggled,
        projectActions.areAllProjectsIncludedUpdated,
      ],
      pushProjectInclusionChangesToTasks,
    ),
  ]);
}

function* pushProjectInclusionChangesToTasks(
  action: ActionType<typeof projectActions>,
): SagaIterator {
  const toolAction = yield select(toolActionSelector);

  const sourceProjectsById = yield select(sourceProjectsByIdSelector);

  const sourceTasks = yield select(sourceTasksSelector);

  for (const sourceTask of sourceTasks) {
    const isProjectIncluded = pathOr(
      false,
      [sourceTask.projectId, "isIncluded"],
      sourceProjectsById,
    );

    if (sourceTask.isIncluded === isProjectIncluded) {
      continue;
    }

    // We don't want to automatically select all the tasks associated with a
    // project if the project is included. The user may not be aware that by
    // including the project, they're automatically including the tasks.
    // We _do_ want to include the tasks associated with a project if that
    // project is included in the deletion process:
    if (and(isProjectIncluded, toolAction === ToolAction.Transfer)) {
      continue;
    }

    const updatePayload = {
      id: sourceTask.id,
      isIncluded: isProjectIncluded,
    };

    if (isActionOf(projectActions.areAllProjectsIncludedUpdated, action)) {
      yield put(isTaskIncludedUpdated(updatePayload));

      return;
    }

    if (isActionOf(projectActions.isProjectIncludedToggled, action)) {
      if (sourceTask.projectId !== action.payload) {
        return;
      }

      yield put(isTaskIncludedUpdated(updatePayload));
    }
  }
}

/**
 * Creates projects in the target tool based on the included projects from the
 * source tool and links them by ID.
 */
export function* createProjectsSaga(): SagaIterator {
  yield put(projectActions.createProjects.request());

  try {
    const { target } = yield select(toolNameByMappingSelector);

    const createSagaForTargetTool =
      target === ToolName.Clockify
        ? clockifySagas.createClockifyProjectsSaga
        : togglSagas.createTogglProjectsSaga;

    const sourceProjects = yield select(sourceProjectsForTransferSelector);
    const targetProjects = yield call(createSagaForTargetTool, sourceProjects);

    const projectsByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceProjects,
      targetProjects,
    );

    yield put(projectActions.createProjects.success(projectsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(projectActions.createProjects.failure());
  }
}

/**
 * Deletes included projects from the source tool.
 */
export function* deleteProjectsSaga(): SagaIterator {
  yield put(projectActions.deleteProjects.request());

  try {
    const { source } = yield select(toolNameByMappingSelector);

    const deleteSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.deleteClockifyProjectsSaga
        : togglSagas.deleteTogglProjectsSaga;

    const sourceProjects = yield select(includedSourceProjectsSelector);

    yield call(deleteSagaForSourceTool, sourceProjects);

    yield put(projectActions.deleteProjects.success());
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(projectActions.deleteProjects.failure());
  }
}

/**
 * Fetches projects from the source and target tools and links them by ID.
 */
export function* fetchProjectsSaga(): SagaIterator {
  yield put(projectActions.fetchProjects.request());

  try {
    const { source, target } = yield select(toolNameByMappingSelector);

    const fetchSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.fetchClockifyProjectsSaga
        : togglSagas.fetchTogglProjectsSaga;

    const sourceProjects = yield call(fetchSagaForSourceTool);

    const toolAction = yield select(toolActionSelector);

    let projectsByIdByMapping: Record<Mapping, Dictionary<Project>>;

    const fetchSagaForTargetTool =
      target === ToolName.Clockify
        ? clockifySagas.fetchClockifyProjectsSaga
        : togglSagas.fetchTogglProjectsSaga;

    if (toolAction === ToolAction.Transfer) {
      const targetProjects = yield call(fetchSagaForTargetTool);

      projectsByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceProjects,
        targetProjects,
      );
    } else {
      projectsByIdByMapping = {
        source: indexBy(prop("id"), sourceProjects),
        target: {},
      };
    }

    yield put(projectActions.fetchProjects.success(projectsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(projectActions.fetchProjects.failure());
  }
}
