import * as R from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/entityOperations/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { showErrorNotification } from "~/modules/app/appActions";
import * as clockifySagas from "~/modules/workspaces/sagas/clockifyWorkspacesSagas";
import * as togglSagas from "~/modules/workspaces/sagas/togglWorkspacesSagas";
import * as workspacesActions from "~/modules/workspaces/workspacesActions";
import { Mapping, ToolAction, ToolName, WorkspacesByIdModel } from "~/typeDefs";

export function* workspacesSaga(): SagaIterator {
  yield all([
    takeEvery(workspacesActions.fetchWorkspaces.request, fetchWorkspacesSaga),
  ]);
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
  } catch (err: AnyValid) {
    yield put(showErrorNotification(err));
    yield put(workspacesActions.fetchWorkspaces.failure());
  }
}
