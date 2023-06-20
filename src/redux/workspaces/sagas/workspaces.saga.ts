import { indexBy, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/api/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/redux/allEntities/allEntities.selectors";
import { errorNotificationShown } from "~/redux/app/app.actions";
import * as clockifySagas from "~/redux/workspaces/sagas/clockifyWorkspaces.sagas";
import * as togglSagas from "~/redux/workspaces/sagas/togglWorkspaces.sagas";
import { fetchWorkspaces } from "~/redux/workspaces/workspaces.actions";
import { Mapping, ToolAction, ToolName, type Workspace } from "~/types";

export function* workspacesSaga(): SagaIterator {
  yield all([takeEvery(fetchWorkspaces.request, fetchWorkspacesSaga)]);
}

function* fetchWorkspacesSaga(): SagaIterator {
  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyWorkspacesSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglWorkspacesSaga,
    };

    const { source, target } = yield select(toolNameByMappingSelector);

    // @ts-expect-error
    const sourceWorkspaces = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);

    let workspaceByIdByMapping: Record<Mapping, Dictionary<Workspace>>;

    if (toolAction === ToolAction.Transfer) {
      // @ts-expect-error
      const targetWorkspaces = yield call(fetchSagaByToolName[target]);

      workspaceByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceWorkspaces,
        targetWorkspaces,
      );
    } else {
      workspaceByIdByMapping = {
        source: indexBy(prop("id"), sourceWorkspaces),
        target: {},
      };
    }

    yield put(fetchWorkspaces.success(workspaceByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(fetchWorkspaces.failure());
  }
}
