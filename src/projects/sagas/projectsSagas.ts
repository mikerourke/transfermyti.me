import { SagaIterator } from "@redux-saga/types";
import { call, put, select } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { createProjects, fetchProjects } from "~/projects/projectsActions";
import { sourceProjectsForTransferSelector } from "~/projects/projectsSelectors";
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
