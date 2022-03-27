import * as R from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/entityOperations/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/modules/app/appActions";
import * as clockifySagas from "~/modules/workspaces/sagas/clockifyWorkspacesSagas";
import * as togglSagas from "~/modules/workspaces/sagas/togglWorkspacesSagas";
import * as workspacesActions from "~/modules/workspaces/workspacesActions";
import { Mapping, ToolAction, ToolName, type Workspace } from "~/typeDefs";

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
    let workspaceByIdByMapping: Record<Mapping, Dictionary<Workspace>>;

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
    yield put(errorNotificationShown(err));
    yield put(workspacesActions.fetchWorkspaces.failure());
  }
}
