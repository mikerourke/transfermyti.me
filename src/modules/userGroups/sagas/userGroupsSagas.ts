import { indexBy, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/entityOperations/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/modules/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/modules/app/appActions";
import * as clockifySagas from "~/modules/userGroups/sagas/clockifyUserGroupsSagas";
import * as togglSagas from "~/modules/userGroups/sagas/togglUserGroupsSagas";
import * as userGroupsActions from "~/modules/userGroups/userGroupsActions";
import {
  includedSourceUserGroupsSelector,
  sourceUserGroupsForTransferSelector,
} from "~/modules/userGroups/userGroupsSelectors";
import { Mapping, ToolAction, ToolName, type UserGroup } from "~/typeDefs";

/**
 * Creates user groups in the target tool based on the included user groups from
 * the source tool and links them by ID.
 */
export function* createUserGroupsSaga(): SagaIterator {
  yield put(userGroupsActions.createUserGroups.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.createClockifyUserGroupsSaga,
      [ToolName.Toggl]: togglSagas.createTogglUserGroupsSaga,
    }[toolNameByMapping.target];

    const sourceUserGroups = yield select(sourceUserGroupsForTransferSelector);
    const targetUserGroups = yield call(createSagaByToolName, sourceUserGroups);
    const userGroupsByIdByMapping = yield call(
      linkEntitiesByIdByMapping,
      sourceUserGroups,
      targetUserGroups,
    );

    yield put(
      userGroupsActions.createUserGroups.success(userGroupsByIdByMapping),
    );
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));
    yield put(userGroupsActions.createUserGroups.failure());
  }
}

/**
 * Deletes included user groups from the source tool.
 */
export function* deleteUserGroupsSaga(): SagaIterator {
  yield put(userGroupsActions.deleteUserGroups.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const deleteSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.deleteClockifyUserGroupsSaga,
      [ToolName.Toggl]: togglSagas.deleteTogglUserGroupsSaga,
    }[toolNameByMapping.source];

    const sourceUserGroups = yield select(includedSourceUserGroupsSelector);
    yield call(deleteSagaByToolName, sourceUserGroups);

    yield put(userGroupsActions.deleteUserGroups.success());
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(userGroupsActions.deleteUserGroups.failure());
  }
}

/**
 * Fetches user groups from the source and target tools and links them by ID.
 */
export function* fetchUserGroupsSaga(): SagaIterator {
  yield put(userGroupsActions.fetchUserGroups.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: clockifySagas.fetchClockifyUserGroupsSaga,
      [ToolName.Toggl]: togglSagas.fetchTogglUserGroupsSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceUserGroups = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);
    let userGroupsByIdByMapping: Record<Mapping, Dictionary<UserGroup>>;

    if (toolAction === ToolAction.Transfer) {
      const targetUserGroups = yield call(fetchSagaByToolName[target]);

      userGroupsByIdByMapping = yield call(
        linkEntitiesByIdByMapping,
        sourceUserGroups,
        targetUserGroups,
      );
    } else {
      userGroupsByIdByMapping = {
        source: indexBy(prop("id"), sourceUserGroups),
        target: {},
      };
    }

    yield put(
      userGroupsActions.fetchUserGroups.success(userGroupsByIdByMapping),
    );
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(userGroupsActions.fetchUserGroups.failure());
  }
}
