import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectTransferMapping } from "~/app/appSelectors";
import {
  createWorkspaces,
  fetchWorkspaces,
  updateActiveWorkspaceId,
} from "~/workspaces/workspacesActions";
import { selectSourceWorkspaces } from "~/workspaces/workspacesSelectors";
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

/**
 * There is no `createTogglWorkspacesSaga` because you're not allowed to create
 * a new workspace through the Toggl API.
 */

export function* workspacesSaga(): SagaIterator {
  yield all([
    takeEvery(createWorkspaces.request, createWorkspacesSaga),
    takeEvery(fetchWorkspaces.request, fetchWorkspacesSaga),
  ]);
}

function* createWorkspacesSaga(): SagaIterator {
  try {
    const sourceWorkspaces = yield select(selectSourceWorkspaces);
    const transferMapping = yield select(selectTransferMapping);

    const transferSagaByToolName = {
      [ToolName.Clockify]: createClockifyWorkspacesSaga,
      [ToolName.Toggl]: createTogglWorkspacesSaga,
    }[transferMapping.target];

    const targetWorkspaces = yield call(transferSagaByToolName);
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
    const { source, target } = yield select(selectTransferMapping);

    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyWorkspacesSaga,
      [ToolName.Toggl]: fetchTogglWorkspacesSaga,
    };
    const [firstWorkspace, ...sourceWorkspaces] = yield call(
      fetchSagaByToolName[source],
    );
    const targetWorkspaces = yield call(fetchSagaByToolName[target]);
    yield put(updateActiveWorkspaceId(firstWorkspace.id));

    const workspaceByIdByMapping = linkEntitiesByIdByMapping<WorkspaceModel>(
      [firstWorkspace, ...sourceWorkspaces],
      targetWorkspaces,
    );
    yield put(fetchWorkspaces.success(workspaceByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchWorkspaces.failure());
  }
}
