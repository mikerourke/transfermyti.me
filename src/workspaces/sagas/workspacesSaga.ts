import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolNameByMapping } from "~/app/appSelectors";
import {
  createWorkspaces,
  fetchWorkspaces,
  updateActiveWorkspaceId,
} from "~/workspaces/workspacesActions";
import { selectSourceWorkspacesForTransfer } from "~/workspaces/workspacesSelectors";
import {
  createClockifyWorkspacesSaga,
  fetchClockifyWorkspacesSaga,
} from "./clockifyWorkspacesSagas";
import {
  createTogglWorkspacesSaga,
  fetchTogglWorkspacesSaga,
} from "./togglWorkspacesSagas";
import { ToolName } from "~/common/commonTypes";
import { WorkspaceModel } from "~/workspaces/workspacesTypes";

export function* workspacesSaga(): SagaIterator {
  yield all([
    takeEvery(createWorkspaces.request, createWorkspacesSaga),
    takeEvery(fetchWorkspaces.request, fetchWorkspacesSaga),
  ]);
}

function* createWorkspacesSaga(): SagaIterator {
  try {
    const toolNameByMapping = yield select(selectToolNameByMapping);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyWorkspacesSaga,
      [ToolName.Toggl]: createTogglWorkspacesSaga,
    }[toolNameByMapping.target];

    const sourceWorkspaces = yield select(selectSourceWorkspacesForTransfer);
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
    const { source, target } = yield select(selectToolNameByMapping);
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
