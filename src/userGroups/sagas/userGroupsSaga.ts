import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { linkEntitiesByIdByMapping } from "~/redux/sagaUtils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolNameByMapping } from "~/app/appSelectors";
import {
  createUserGroups,
  fetchUserGroups,
} from "~/userGroups/userGroupsActions";
import { selectSourceUserGroupsForTransfer } from "~/userGroups/userGroupsSelectors";
import {
  createClockifyUserGroupsSaga,
  fetchClockifyUserGroupsSaga,
} from "./clockifyUserGroupsSagas";
import {
  createTogglUserGroupsSaga,
  fetchTogglUserGroupsSaga,
} from "./togglUserGroupsSagas";
import { ToolName } from "~/common/commonTypes";
import { UserGroupModel } from "~/userGroups/userGroupsTypes";

export function* userGroupsSaga(): SagaIterator {
  yield all([
    takeEvery(createUserGroups.request, createUserGroupsSaga),
    takeEvery(fetchUserGroups.request, fetchUserGroupsSaga),
  ]);
}

function* createUserGroupsSaga(): SagaIterator {
  try {
    const toolNameByMapping = yield select(selectToolNameByMapping);
    const createSagaByToolName = {
      [ToolName.Clockify]: createClockifyUserGroupsSaga,
      [ToolName.Toggl]: createTogglUserGroupsSaga,
    }[toolNameByMapping.target];

    const sourceUserGroups = yield select(selectSourceUserGroupsForTransfer);
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

function* fetchUserGroupsSaga(): SagaIterator {
  try {
    const fetchSagaByToolName = {
      [ToolName.Clockify]: fetchClockifyUserGroupsSaga,
      [ToolName.Toggl]: fetchTogglUserGroupsSaga,
    };
    const { source, target } = yield select(selectToolNameByMapping);
    const sourceUserGroups = yield call(fetchSagaByToolName[source]);
    const targetUserGroups = yield call(fetchSagaByToolName[target]);

    const userGroupsByIdByMapping = linkEntitiesByIdByMapping<UserGroupModel>(
      sourceUserGroups,
      targetUserGroups,
    );

    yield put(fetchUserGroups.success(userGroupsByIdByMapping));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchUserGroups.failure());
  }
}
