import { all, select, put, takeEvery } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import {
  createClockifyWorkspaces,
  createWorkspaces,
  fetchClockifyWorkspaces,
  fetchTogglWorkspaces,
  fetchWorkspaces,
} from "~/workspaces/workspacesActions";
import {
  createClockifyWorkspacesSaga,
  fetchClockifyWorkspacesSaga,
} from "./clockifyWorkspacesSaga";
import { fetchTogglWorkspacesSaga } from "./togglWorkspacesSaga";
import { selectTransferMapping } from "~/app/appSelectors";
import { ToolName } from "~/common/commonTypes";

/**
 * There is no `createTogglWorkspacesSaga` because you're not allowed to create
 * a new workspace through the Toggl API.
 */

export function* workspacesSaga(): SagaIterator {
  yield all([
    takeEvery(createClockifyWorkspaces.request, createClockifyWorkspacesSaga),
    takeEvery(createWorkspaces, createWorkspacesSaga),
    takeEvery(fetchClockifyWorkspaces.request, fetchClockifyWorkspacesSaga),
    takeEvery(fetchTogglWorkspaces.request, fetchTogglWorkspacesSaga),
    takeEvery(fetchWorkspaces, fetchWorkspacesSaga),
  ]);
}

function* createWorkspacesSaga(): SagaIterator {
  const transferMapping = yield select(selectTransferMapping);
  switch (transferMapping.target) {
    case ToolName.Clockify:
      yield put(createClockifyWorkspaces.request());
      break;

    default:
      break;
  }
}

function* fetchWorkspacesSaga(
  action: ActionType<typeof fetchWorkspaces>,
): SagaIterator {
  const transferMapping = yield select(selectTransferMapping);
  switch (transferMapping[action.payload]) {
    case ToolName.Clockify:
      yield put(fetchClockifyWorkspaces.request());
      break;

    case ToolName.Toggl:
      yield put(fetchTogglWorkspaces.request());
      break;

    default:
      break;
  }
}
