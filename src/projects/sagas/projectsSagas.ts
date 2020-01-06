import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { isActionOf } from "typesafe-actions";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import {
  createProjects,
  fetchProjects,
  flipIsProjectIncluded,
  updateAreAllProjectsIncluded,
} from "~/projects/projectsActions";
import {
  sourceProjectsByIdSelector,
  sourceProjectsForTransferSelector,
} from "~/projects/projectsSelectors";
import { updateIsTaskIncluded } from "~/tasks/tasksActions";
import { sourceTasksSelector } from "~/tasks/tasksSelectors";
import {
  createClockifyProjectsSaga,
  fetchClockifyProjectsSaga,
} from "./clockifyProjectsSagas";
import {
  createTogglProjectsSaga,
  fetchTogglProjectsSaga,
} from "./togglProjectsSagas";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { ProjectModel } from "~/projects/projectsTypes";
import { ReduxAction } from "~/redux/reduxTypes";

export function* projectMonitoringSaga(): SagaIterator {
  yield all([
    takeEvery(flipIsProjectIncluded, pushProjectInclusionChangesToTasks),
    takeEvery(updateAreAllProjectsIncluded, pushProjectInclusionChangesToTasks),
  ]);
}

function* pushProjectInclusionChangesToTasks(
  action: ReduxAction<string | boolean>,
): SagaIterator {
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

    const updatePayload = {
      id: sourceTask.id,
      isIncluded: isProjectIncluded,
    };

    switch (true) {
      case isActionOf(updateAreAllProjectsIncluded, action):
        yield put(updateIsTaskIncluded(updatePayload));
        break;

      case isActionOf(flipIsProjectIncluded, action):
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

export function* createProjectsSaga(): SagaIterator {
  yield put(createProjects.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyProjectsSaga,
      [ToolName.Toggl]: createTogglProjectsSaga,
    }[toolNameByMapping.target];

    const sourceProjects = yield select(sourceProjectsForTransferSelector);
    const targetProjects = yield call(createSagaByToolName, sourceProjects);
    const projectsByIdByMapping = linkEntitiesByIdByMapping<ProjectModel>(
      sourceProjects,
      targetProjects,
    );

    yield put(createProjects.success(projectsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createProjects.failure());
  }
}

export function* fetchProjectsSaga(): SagaIterator {
  yield put(fetchProjects.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyProjectsSaga,
      [ToolName.Toggl]: fetchTogglProjectsSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceProjects = yield call(fetchSagaByToolName[source]);
    const targetProjects = yield call(fetchSagaByToolName[target]);

    const projectsByIdByMapping = linkEntitiesByIdByMapping<ProjectModel>(
      sourceProjects,
      targetProjects,
    );

    yield put(fetchProjects.success(projectsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchProjects.failure());
  }
}
