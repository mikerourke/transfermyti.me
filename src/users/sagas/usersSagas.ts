import { call, put, select } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { toolNameByMappingSelector } from "~/app/appSelectors";
import { createUsers, fetchUsers } from "~/users/usersActions";
import { sourceUserEmailsByWorkspaceIdSelector } from "~/users/usersSelectors";
import {
  createClockifyUsersSaga,
  fetchClockifyUsersSaga,
} from "./clockifyUsersSagas";
import { createTogglUsersSaga, fetchTogglUsersSaga } from "./togglUsersSagas";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { UserModel } from "~/users/usersTypes";

export function* createUsersSaga(): SagaIterator {
  yield put(createUsers.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyUsersSaga,
      [ToolName.Toggl]: createTogglUsersSaga,
    }[toolNameByMapping.target];

    const emailsByUserId = yield select(sourceUserEmailsByWorkspaceIdSelector);
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

export function* fetchUsersSaga(): SagaIterator {
  yield put(fetchUsers.request());
  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyUsersSaga,
      [ToolName.Toggl]: fetchTogglUsersSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
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
