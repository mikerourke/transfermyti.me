import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectTransferMapping } from "~/app/appSelectors";
import { createUsers, fetchUsers } from "~/users/usersActions";
import { selectSourceUserEmailsByWorkspaceId } from "~/users/usersSelectors";
import {
  createClockifyUsersSaga,
  fetchClockifyUsersSaga,
} from "./clockifyUsersSagas";
import { createTogglUsersSaga, fetchTogglUsersSaga } from "./togglUsersSagas";
import { ToolName } from "~/common/commonTypes";
import { UserModel } from "~/users/usersTypes";

export function* usersSaga(): SagaIterator {
  yield all([
    takeEvery(createUsers.request, createUsersSaga),
    takeEvery(fetchUsers.request, fetchUsersSaga),
  ]);
}

function* createUsersSaga(): SagaIterator {
  try {
    const emailsByUserId = yield select(selectSourceUserEmailsByWorkspaceId);
    const transferMapping = yield select(selectTransferMapping);

    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyUsersSaga,
      [ToolName.Toggl]: createTogglUsersSaga,
    }[transferMapping.target];

    yield call(createSagaByToolName, emailsByUserId);

    yield put(createUsers.success());

    // We're calling the fetch function here because "creating" users on the
    // target only _invites_ them to the workspace.
    yield call(fetchUsersSaga);
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createUsers.failure());
  }
}

function* fetchUsersSaga(): SagaIterator {
  try {
    const { source, target } = yield select(selectTransferMapping);

    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyUsersSaga,
      [ToolName.Toggl]: fetchTogglUsersSaga,
    };
    const sourceUsers = yield call(fetchSagaByToolName[source]);
    const targetUsers = yield call(fetchSagaByToolName[target]);

    const usersByIdByMapping = linkEntitiesByIdByMapping<UserModel>(
      sourceUsers,
      targetUsers,
    );
    yield put(fetchUsers.success(usersByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchUsers.failure());
  }
}
