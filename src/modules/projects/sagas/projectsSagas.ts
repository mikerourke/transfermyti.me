import * as R from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { isActionOf } from "typesafe-actions";

import { linkEntitiesByIdByMapping } from "~/entityOperations/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { showErrorNotification } from "~/modules/app/appActions";
import * as projectActions from "~/modules/projects/projectsActions";
import {
  includedSourceProjectsSelector,
  sourceProjectsByIdSelector,
  sourceProjectsForTransferSelector,
} from "~/modules/projects/projectsSelectors";
import { updateIsTaskIncluded } from "~/modules/tasks/tasksActions";
import { sourceTasksSelector } from "~/modules/tasks/tasksSelectors";
import {
  Mapping,
  ProjectsByIdModel,
  ReduxAction,
  ToolAction,
  ToolName,
} from "~/typeDefs";

import * as clockifySagas from "./clockifyProjectsSagas";
import * as togglSagas from "./togglProjectsSagas";

export function* projectMonitoringSaga(): SagaIterator {
  yield all([
    takeEvery(
      projectActions.flipIsProjectIncluded,
      pushProjectInclusionChangesToTasks,
    ),
    takeEvery(
      projectActions.updateAreAllProjectsIncluded,
      pushProjectInclusionChangesToTasks,
    ),
  ]);
}

function* pushProjectInclusionChangesToTasks(
  action: ReduxAction<string | boolean>,
): SagaIterator {
  const toolAction = yield select(toolActionSelector);
  const sourceProjectsById = yield select(sourceProjectsByIdSelector);
  const sourceTasks = yield select(sourceTasksSelector);

  for (const sourceTask of sourceTasks) {
    const isProjectIncluded = R.pathOr(
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
    if (R.and(isProjectIncluded, toolAction === ToolAction.Transfer)) {
      continue;
    }

    const updatePayload = {
      id: sourceTask.id,
      isIncluded: isProjectIncluded,
    };

    switch (true) {
      case isActionOf(projectActions.updateAreAllProjectsIncluded, action):
        yield put(updateIsTaskIncluded(updatePayload));
        break;

      case isActionOf(projectActions.flipIsProjectIncluded, action):
        if (sourceTask.projectId !== action.payload) {
          break;
        }

        yield put(updateIsTaskIncluded(updatePayload));
        break;

      default:
        break;
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
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.createClockifyProjectsSaga,
      [ToolName.Toggl]: togglSagas.createTogglProjectsSaga,
    }[toolNameByMapping.target];

    const sourceProjects = yield select(sourceProjectsForTransferSelector);
    const targetProjects = yield call(createSagaByToolName, sourceProjects);
    const projectsByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceProjects,
      targetProjects,
    );

    yield put(projectActions.createProjects.success(projectsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(projectActions.createProjects.failure());
  }
}

/**
 * Deletes included projects from the source tool.
 */
export function* deleteProjectsSaga(): SagaIterator {
  yield put(projectActions.deleteProjects.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const deleteSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.deleteClockifyProjectsSaga,
      [ToolName.Toggl]: togglSagas.deleteTogglProjectsSaga,
    }[toolNameByMapping.source];

    const sourceProjects = yield select(includedSourceProjectsSelector);
    yield call(deleteSagaByToolName, sourceProjects);

    yield put(projectActions.deleteProjects.success());
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(projectActions.deleteProjects.failure());
  }
}

/**
 * Fetches projects from the source and target tools and links them by ID.
 */
export function* fetchProjectsSaga(): SagaIterator {
  yield put(projectActions.fetchProjects.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyProjectsSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglProjectsSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceProjects = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);
    let projectsByIdByMapping: Record<Mapping, ProjectsByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      const targetProjects = yield call(fetchSagaByToolName[target]);

      projectsByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceProjects,
        targetProjects,
      );
    } else {
      projectsByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceProjects),
        target: {},
      };
    }

    yield put(projectActions.fetchProjects.success(projectsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(projectActions.fetchProjects.failure());
  }
}
