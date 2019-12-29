import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import {
  createClientsSaga,
  fetchClientsSaga,
} from "~/clients/sagas/clientsSagas";
import {
  createProjectsSaga,
  fetchProjectsSaga,
} from "~/projects/sagas/projectsSagas";
import { createTagsSaga, fetchTagsSaga } from "~/tags/sagas/tagsSagas";
import { createTasksSaga, fetchTasksSaga } from "~/tasks/sagas/tasksSagas";
import {
  createTimeEntriesSaga,
  fetchTimeEntriesSaga,
} from "~/timeEntries/sagas/timeEntriesSagas";
import {
  createUserGroupsSaga,
  fetchUserGroupsSaga,
} from "~/userGroups/sagas/userGroupsSagas";
import { createUsersSaga, fetchUsersSaga } from "~/users/sagas/usersSagas";
import {
  createAllEntities,
  fetchAllEntities,
  updateEntityGroupInProcess,
} from "./allEntitiesActions";
import { lastFetchTimeSelector } from "./allEntitiesSelectors";
import { EntityGroup } from "./allEntitiesTypes";

export function* allEntitiesSaga(): SagaIterator {
  yield all([
    takeEvery(createAllEntities.request, createAllEntitiesSaga),
    takeEvery(fetchAllEntities.request, fetchAllEntitiesSaga),
  ]);
}

function* createAllEntitiesSaga(): SagaIterator {
  try {
    yield put(updateEntityGroupInProcess(EntityGroup.Clients));
    yield call(createClientsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Projects));
    yield call(createProjectsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Tags));
    yield call(createTagsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Tasks));
    yield call(createTasksSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.UserGroups));
    yield call(createUserGroupsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Users));
    yield call(createUsersSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.TimeEntries));
    yield call(createTimeEntriesSaga);

    yield put(createAllEntities.success());
  } catch (err) {
    yield put(createAllEntities.failure());
  }
}

function* fetchAllEntitiesSaga(): SagaIterator {
  const lastFetchTime = yield select(lastFetchTimeSelector);
  if (lastFetchTime !== null) {
    return;
  }

  try {
    yield put(updateEntityGroupInProcess(EntityGroup.Clients));
    yield call(fetchClientsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Projects));
    yield call(fetchProjectsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Tags));
    yield call(fetchTagsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Tasks));
    yield call(fetchTasksSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.UserGroups));
    yield call(fetchUserGroupsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Users));
    yield call(fetchUsersSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.TimeEntries));
    yield call(fetchTimeEntriesSaga);

    yield put(fetchAllEntities.success());
  } catch (err) {
    yield put(fetchAllEntities.failure());
  }
}
