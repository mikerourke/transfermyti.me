import { indexBy, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/api/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/redux/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/redux/app/appActions";
import * as clockifySagas from "~/redux/users/sagas/clockifyUsersSagas";
import * as togglSagas from "~/redux/users/sagas/togglUsersSagas";
import * as usersActions from "~/redux/users/usersActions";
import {
  includedSourceUsersSelector,
  sourceUserEmailsByWorkspaceIdSelector,
} from "~/redux/users/usersSelectors";
import { Mapping, ToolAction, ToolName, type User } from "~/typeDefs";

/**
 * Invites users to the target tool based on the source users.
 * @todo Validate this functionality, it definitely needs more work.
 */
export function* createUsersSaga(): SagaIterator {
  yield put(usersActions.createUsers.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);

    const createSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.createClockifyUsersSaga,
      [ToolName.Toggl]: togglSagas.createTogglUsersSaga,
    }[toolNameByMapping.target];

    const emailsByUserId = yield select(sourceUserEmailsByWorkspaceIdSelector);

    yield call(createSagaByToolName, emailsByUserId);

    yield put(usersActions.createUsers.success());

    // We're calling the fetch function here because "creating" users on the
    // target only _invites_ them to the workspace.
    yield call(fetchUsersSaga);
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(usersActions.createUsers.failure());
  }
}

/**
 * Deletes included users from the source tool.
 */
export function* deleteUsersSaga(): SagaIterator {
  yield put(usersActions.deleteUsers.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);

    const deleteSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.removeClockifyUsersSaga,
      [ToolName.Toggl]: togglSagas.removeTogglUsersSaga,
    }[toolNameByMapping.source];

    const sourceUsers = yield select(includedSourceUsersSelector);

    yield call(deleteSagaByToolName, sourceUsers);

    yield put(usersActions.deleteUsers.success());
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(usersActions.deleteUsers.failure());
  }
}

/**
 * Fetches users from the source and target tools and links them by ID.
 */
export function* fetchUsersSaga(): SagaIterator {
  yield put(usersActions.fetchUsers.request());
  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyUsersSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglUsersSaga,
    };

    const { source, target } = yield select(toolNameByMappingSelector);

    const sourceUsers = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);

    let usersByIdByMapping: Record<Mapping, Dictionary<User>>;

    if (toolAction === ToolAction.Transfer) {
      const targetUsers = yield call(fetchSagaByToolName[target]);

      usersByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceUsers,
        targetUsers,
      );
    } else {
      usersByIdByMapping = {
        source: indexBy(prop("id"), sourceUsers),
        target: {},
      };
    }

    yield put(usersActions.fetchUsers.success(usersByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(usersActions.fetchUsers.failure());
  }
}
