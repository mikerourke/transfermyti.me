import { all, select, put, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { ActionType } from "typesafe-actions";
import {
  createClockifyWorkspaces,
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
    takeEvery(fetchWorkspaces, fetchWorkspacesSaga),
    takeEvery(createClockifyWorkspaces.request, createClockifyWorkspacesSaga),
    takeEvery(fetchClockifyWorkspaces.request, fetchClockifyWorkspacesSaga),
    takeEvery(fetchTogglWorkspaces.request, fetchTogglWorkspacesSaga),
  ]);
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
