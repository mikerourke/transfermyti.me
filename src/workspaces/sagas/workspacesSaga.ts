import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/allEntities/allEntitiesSelectors";
import { showErrorNotification } from "~/app/appActions";
import * as workspacesActions from "~/workspaces/workspacesActions";
import { sourceWorkspacesForTransferSelector } from "~/workspaces/workspacesSelectors";
import * as clockifySagas from "./clockifyWorkspacesSagas";
import * as togglSagas from "./togglWorkspacesSagas";
import { Mapping, ToolAction, ToolName, WorkspacesByIdModel } from "~/typeDefs";

export function* workspacesSaga(): SagaIterator {
  yield all([
    takeEvery(workspacesActions.fetchWorkspaces.request, fetchWorkspacesSaga),
  ]);
}

export function* createWorkspacesSaga(): SagaIterator {
  yield put(workspacesActions.createWorkspaces.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.createClockifyWorkspacesSaga,
      [ToolName.Toggl]: togglSagas.createTogglWorkspacesSaga,
    }[toolNameByMapping.target];

    const sourceWorkspaces = yield select(sourceWorkspacesForTransferSelector);
    const targetWorkspaces = yield call(createSagaByToolName, sourceWorkspaces);
    const workspaceByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceWorkspaces,
      targetWorkspaces,
    );

    yield put(
      workspacesActions.createWorkspaces.success(workspaceByIdByMapping),
    );
  } catch (err) {
    yield put(showErrorNotification(err));
    yield put(workspacesActions.createWorkspaces.failure());
  }
}

function* fetchWorkspacesSaga(): SagaIterator {
  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyWorkspacesSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglWorkspacesSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceWorkspaces = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);
    let workspaceByIdByMapping: Record<Mapping, WorkspacesByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      const targetWorkspaces = yield call(fetchSagaByToolName[target]);

      workspaceByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceWorkspaces,
        targetWorkspaces,
      );
    } else {
      workspaceByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceWorkspaces),
        target: {},
      };
    }

    yield put(
      workspacesActions.fetchWorkspaces.success(workspaceByIdByMapping),
    );
  } catch (err) {
    yield put(showErrorNotification(err));
    yield put(workspacesActions.fetchWorkspaces.failure());
  }
}
