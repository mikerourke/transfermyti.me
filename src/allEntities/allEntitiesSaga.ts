import { SagaIterator } from "@redux-saga/types";
import { all, call, put, takeEvery } from "redux-saga/effects";
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
// import {
//   createUserGroupsSaga,
//   fetchUserGroupsSaga,
// } from "~/userGroups/sagas/userGroupsSagas";
// import {
//   createUsersSaga,
//   fetchUsersSaga,
// } from "~/users/sagas/usersSagas";
import {
  createAllEntities,
  fetchAllEntities,
  updateEntityGroupInProcess,
} from "./allEntitiesActions";
import { EntityGroup } from "./allEntitiesTypes";

/**
 * Creates or fetches all entities when the `request` action is dispatched.
 * The fetch order is important! For example, tasks _must_ be associated with
 * a project, so if the projects haven't been fetched yet, the tasks cannot
 * be fetched.
 */
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

    yield put(updateEntityGroupInProcess(EntityGroup.Tags));
    yield call(createTagsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Projects));
    yield call(createProjectsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Tasks));
    yield call(createTasksSaga);

    // TODO: Add this back in once you hash out multi-user transfers.
    // yield put(updateEntityGroupInProcess(EntityGroup.UserGroups));
    // yield call(createUserGroupsSaga);

    // yield put(updateEntityGroupInProcess(EntityGroup.Users));
    // yield call(createUsersSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.TimeEntries));
    yield call(createTimeEntriesSaga);

    yield put(createAllEntities.success());
  } catch (err) {
    yield put(createAllEntities.failure());
  }
}

function* fetchAllEntitiesSaga(): SagaIterator {
  try {
    yield put(updateEntityGroupInProcess(EntityGroup.Clients));
    yield call(fetchClientsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Tags));
    yield call(fetchTagsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Projects));
    yield call(fetchProjectsSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.Tasks));
    yield call(fetchTasksSaga);

    // TODO: Add this back in once you hash out multi-user transfers.
    // yield put(updateEntityGroupInProcess(EntityGroup.UserGroups));
    // yield call(fetchUserGroupsSaga);

    // yield put(updateEntityGroupInProcess(EntityGroup.Users));
    // yield call(fetchUsersSaga);

    yield put(updateEntityGroupInProcess(EntityGroup.TimeEntries));
    yield call(fetchTimeEntriesSaga);

    yield put(fetchAllEntities.success());
  } catch (err) {
    yield put(fetchAllEntities.failure());
  }
}
