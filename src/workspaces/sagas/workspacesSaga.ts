import { SagaIterator } from "@redux-saga/types";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import {
  createWorkspaces,
  fetchWorkspaces,
  updateActiveWorkspaceId,
} from "~/workspaces/workspacesActions";
import { sourceWorkspacesForTransferSelector } from "~/workspaces/workspacesSelectors";
import {
  createClockifyWorkspacesSaga,
  fetchClockifyWorkspacesSaga,
} from "./clockifyWorkspacesSagas";
import {
  createTogglWorkspacesSaga,
  fetchTogglWorkspacesSaga,
} from "./togglWorkspacesSagas";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

export function* workspacesSaga(): SagaIterator {
  yield all([
    takeEvery(createWorkspaces.request, createWorkspacesSaga),
    takeEvery(fetchWorkspaces.request, fetchWorkspacesSaga),
  ]);
}

function* createWorkspacesSaga(): SagaIterator {
  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyWorkspacesSaga,
      [ToolName.Toggl]: createTogglWorkspacesSaga,
    }[toolNameByMapping.target];

    const sourceWorkspaces = yield select(sourceWorkspacesForTransferSelector);
    const targetWorkspaces = yield call(createSagaByToolName, sourceWorkspaces);
    const workspaceByIdByMapping = linkEntitiesByIdByMapping<WorkspaceModel>(
      sourceWorkspaces,
      targetWorkspaces,
    );

    yield put(createWorkspaces.success(workspaceByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createWorkspaces.failure());
  }
}

function* fetchWorkspacesSaga(): SagaIterator {
  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyWorkspacesSaga,
      [ToolName.Toggl]: fetchTogglWorkspacesSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceWorkspaces = yield call(fetchSagaByToolName[source]);
    const targetWorkspaces = yield call(fetchSagaByToolName[target]);

    if (sourceWorkspaces.length !== 0) {
      const [firstWorkspace] = sourceWorkspaces;
      yield put(updateActiveWorkspaceId(firstWorkspace.id));
    }

    const workspaceByIdByMapping = linkEntitiesByIdByMapping<WorkspaceModel>(
      sourceWorkspaces,
      targetWorkspaces,
    );

    yield put(fetchWorkspaces.success(workspaceByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchWorkspaces.failure());
  }
}
