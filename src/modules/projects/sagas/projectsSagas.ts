import { and, indexBy, pathOr, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/entityOperations/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/modules/app/appActions";
import * as projectActions from "~/modules/projects/projectsActions";
import {
  includedSourceProjectsSelector,
  sourceProjectsByIdSelector,
  sourceProjectsForTransferSelector,
} from "~/modules/projects/projectsSelectors";
import * as clockifySagas from "~/modules/projects/sagas/clockifyProjectsSagas";
import * as togglSagas from "~/modules/projects/sagas/togglProjectsSagas";
import { isTaskIncludedUpdated } from "~/modules/tasks/tasksActions";
import { sourceTasksSelector } from "~/modules/tasks/tasksSelectors";
import { isActionOf, type ActionType } from "~/redux/reduxTools";
import { Mapping, ToolAction, ToolName, type Project } from "~/typeDefs";

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
    const toolNameByMapping = yield select(toolNameByMappingSelector);

    const deleteSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.deleteClockifyProjectsSaga,
      [ToolName.Toggl]: togglSagas.deleteTogglProjectsSaga,
    }[toolNameByMapping.source];

    const sourceProjects = yield select(includedSourceProjectsSelector);

    yield call(deleteSagaByToolName, sourceProjects);

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
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyProjectsSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglProjectsSaga,
    };

    const { source, target } = yield select(toolNameByMappingSelector);

    const sourceProjects = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);

    let projectsByIdByMapping: Record<Mapping, Dictionary<Project>>;

    if (toolAction === ToolAction.Transfer) {
      const targetProjects = yield call(fetchSagaByToolName[target]);

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
