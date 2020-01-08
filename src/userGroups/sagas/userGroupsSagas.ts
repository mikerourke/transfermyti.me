import { SagaIterator } from "@redux-saga/types";
import * as R from "ramda";
import { call, put, select } from "redux-saga/effects";
import { linkEntitiesByIdByMapping } from "~/redux/reduxUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import {
  toolActionSelector,
  toolNameByMappingSelector,
} from "~/app/appSelectors";
import {
  createUserGroups,
  fetchUserGroups,
} from "~/userGroups/userGroupsActions";
import { sourceUserGroupsForTransferSelector } from "~/userGroups/userGroupsSelectors";
import {
  createClockifyUserGroupsSaga,
  fetchClockifyUserGroupsSaga,
} from "./clockifyUserGroupsSagas";
import {
  createTogglUserGroupsSaga,
  fetchTogglUserGroupsSaga,
} from "./togglUserGroupsSagas";
import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";
import { ToolAction } from "~/app/appTypes";
import {
  UserGroupModel,
  UserGroupsByIdModel,
} from "~/userGroups/userGroupsTypes";

export function* createUserGroupsSaga(): SagaIterator {
  yield put(createUserGroups.request());

  try {
    const toolNameByMapping = yield select(toolNameByMappingSelector);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyUserGroupsSaga,
      [ToolName.Toggl]: createTogglUserGroupsSaga,
    }[toolNameByMapping.target];

    const sourceUserGroups = yield select(sourceUserGroupsForTransferSelector);
    const targetUserGroups = yield call(createSagaByToolName, sourceUserGroups);
    const userGroupsByIdByMapping = linkEntitiesByIdByMapping<UserGroupModel>(
      sourceUserGroups,
      targetUserGroups,
    );

    yield put(createUserGroups.success(userGroupsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createUserGroups.failure());
  }
}

export function* fetchUserGroupsSaga(): SagaIterator {
  yield put(fetchUserGroups.request());

  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyUserGroupsSaga,
      [ToolName.Toggl]: fetchTogglUserGroupsSaga,
    };
    const { source, target } = yield select(toolNameByMappingSelector);
    const sourceUserGroups = yield call(fetchSagaByToolName[source]);

    const toolAction = yield select(toolActionSelector);
    let userGroupsByIdByMapping: Record<Mapping, UserGroupsByIdModel>;

    if (toolAction === ToolAction.Transfer) {
      const targetUserGroups = yield call(fetchSagaByToolName[target]);

      userGroupsByIdByMapping = linkEntitiesByIdByMapping<UserGroupModel>(
        sourceUserGroups,
        targetUserGroups,
      );
    } else {
      userGroupsByIdByMapping = {
        source: R.indexBy(R.prop("id"), sourceUserGroups),
        target: {},
      };
    }

    yield put(fetchUserGroups.success(userGroupsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchUserGroups.failure());
  }
}
