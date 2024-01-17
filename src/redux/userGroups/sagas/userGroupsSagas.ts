import { indexBy, prop } from "ramda";
import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { linkEntitiesByIdByMapping } from "~/api/linkEntitiesByIdByMapping";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/redux/allEntities/allEntitiesSelectors";
import { errorNotificationShown } from "~/redux/app/appActions";
import * as clockifySagas from "~/redux/userGroups/sagas/clockifyUserGroupsSagas";
import * as togglSagas from "~/redux/userGroups/sagas/togglUserGroupsSagas";
import * as userGroupsActions from "~/redux/userGroups/userGroupsActions";
import {
  includedSourceUserGroupsSelector,
  sourceUserGroupsForTransferSelector,
} from "~/redux/userGroups/userGroupsSelectors";
import { Mapping, ToolAction, ToolName, type UserGroup } from "~/types";

/**
 * Creates user groups in the target tool based on the included user groups from
 * the source tool and links them by ID.
 */
export function* createUserGroupsSaga(): SagaIterator {
  yield put(userGroupsActions.createUserGroups.request());

  try {
    const { target } = yield select(toolNameByMappingSelector);

    const createSagaForTargetTool =
      target === ToolName.Clockify
        ? clockifySagas.createClockifyUserGroupsSaga
        : togglSagas.createTogglUserGroupsSaga;

    const sourceUserGroups = yield select(sourceUserGroupsForTransferSelector);

    const targetUserGroups = yield call(
      createSagaForTargetTool,
      sourceUserGroups,
    );

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
    const { source } = yield select(toolNameByMappingSelector);

    const deleteSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.deleteClockifyUserGroupsSaga
        : togglSagas.deleteTogglUserGroupsSaga;

    const sourceUserGroups = yield select(includedSourceUserGroupsSelector);

    yield call(deleteSagaForSourceTool, sourceUserGroups);

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
    const { source, target } = yield select(toolNameByMappingSelector);

    const fetchSagaForSourceTool =
      source === ToolName.Clockify
        ? clockifySagas.fetchClockifyUserGroupsSaga
        : togglSagas.fetchTogglUserGroupsSaga;

    const sourceUserGroups = yield call(fetchSagaForSourceTool);

    const toolAction = yield select(toolActionSelector);

    let userGroupsByIdByMapping: Record<Mapping, Dictionary<UserGroup>>;

    if (toolAction === ToolAction.Transfer) {
      const fetchSagaForTargetTool =
        target === ToolName.Clockify
          ? clockifySagas.fetchClockifyUserGroupsSaga
          : togglSagas.fetchTogglUserGroupsSaga;

      const targetUserGroups = yield call(fetchSagaForTargetTool);

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

    // prettier-ignore
    yield put(userGroupsActions.fetchUserGroups.success(userGroupsByIdByMapping));
  } catch (err: AnyValid) {
    yield put(errorNotificationShown(err));

    yield put(userGroupsActions.fetchUserGroups.failure());
  }
}
