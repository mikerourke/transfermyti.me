import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, put, select } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/app/appSelectors";
import { createUsers, fetchUsers } from "~/users/usersActions";
import { sourceUserEmailsByWorkspaceIdSelector } from "~/users/usersSelectors";
import {
  createClockifyUsersSaga,
  fetchClockifyUsersSaga,
} from "./clockifyUsersSagas";
import { createTogglUsersSaga, fetchTogglUsersSaga } from "./togglUsersSagas";
import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";
import { ToolAction } from "~/app/appTypes";
import { UserModel, UsersByIdModel } from "~/users/usersTypes";

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

    const toolAction = yield select(toolActionSelector);
    let usersByIdByMapping: Record<Mapping, UsersByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      const targetUsers = yield call(fetchSagaByToolName[target]);

      usersByIdByMapping = linkEntitiesByIdByMapping<UserModel>(
        sourceUsers,
        targetUsers,
      );
    } else {
      usersByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceUsers),
        target: {},
      };
    }

    yield put(fetchUsers.success(usersByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchUsers.failure());
  }
}
