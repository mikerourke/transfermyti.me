import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectTransferMapping } from "~/app/appSelectors";
import { createProjects, fetchProjects } from "~/projects/projectsActions";
import { selectSourceProjectsForTransfer } from "~/projects/projectsSelectors";
import { selectInlcudedWorkspaceIdsByMapping } from "~/workspaces/workspacesSelectors";
import {
  createClockifyProjectsSaga,
  fetchClockifyProjectsSaga,
} from "./clockifyProjectsSagas";
import {
  createTogglProjectsSaga,
  fetchTogglProjectsSaga,
} from "./togglProjectsSagas";
import { ProjectModel } from "~/projects/projectsTypes";
import { ToolName } from "~/common/commonTypes";

export function* projectsSaga(): SagaIterator {
  yield all([
    takeEvery(createProjects.request, createProjectsSaga),
    takeEvery(fetchProjects.request, fetchProjectsSaga),
  ]);
}

function* createProjectsSaga(): SagaIterator {
  try {
    const sourceProjects = yield select(selectSourceProjectsForTransfer);
    const transferMapping = yield select(selectTransferMapping);

    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyProjectsSaga,
      [ToolName.Toggl]: createTogglProjectsSaga,
    }[transferMapping.target];

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

function* fetchProjectsSaga(): SagaIterator {
  try {
    const { source, target } = yield select(selectTransferMapping);

    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyProjectsSaga,
      [ToolName.Toggl]: fetchTogglProjectsSaga,
    };
    const workspaceIdsByMapping = yield select(
      selectInlcudedWorkspaceIdsByMapping,
    );

    const sourceProjects = yield call(
      fetchSagaByToolName[source],
      workspaceIdsByMapping.source,
    );
    const targetProjects = yield call(
      fetchSagaByToolName[target],
      workspaceIdsByMapping.target,
    );

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
