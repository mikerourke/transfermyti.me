import { SagaIterator } from "@redux-saga/types";

import { all, call, put, takeEvery } from "redux-saga/effects";

import * as clientsSagas from "~/clients/sagas/clientsSagas";
import * as projectsSagas from "~/projects/sagas/projectsSagas";
import * as tagsSagas from "~/tags/sagas/tagsSagas";
import * as tasksSagas from "~/tasks/sagas/tasksSagas";
import * as timeEntriesSagas from "~/timeEntries/sagas/timeEntriesSagas";
import { EntityGroup } from "~/typeDefs";
import * as userGroupsSagas from "~/userGroups/sagas/userGroupsSagas";
import * as usersSagas from "~/users/sagas/usersSagas";

import * as allEntitiesActions from "./allEntitiesActions";

export function* allEntitiesSaga(): SagaIterator {
  yield all([
    takeEvery(
      allEntitiesActions.createAllEntities.request,
      createAllEntitiesSaga,
    ),
    takeEvery(
      allEntitiesActions.deleteAllEntities.request,
      deleteAllEntitiesSaga,
    ),
    takeEvery(
      allEntitiesActions.fetchAllEntities.request,
      fetchAllEntitiesSaga,
    ),
  ]);
}

/**
 * Creates all entity records that the user selected from the inclusions page
 * on the _target_ tool based on what was selected from the source tool.
 * The ordering is important! For example, tasks _must_ be associated with a
 * project, so if a project hasn't been created yet, the corresponding tasks
 * cannot be created.
 */
function* createAllEntitiesSaga(): SagaIterator {
  try {
    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Clients),
    );
    yield call(clientsSagas.createClientsSaga);

    yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Tags));
    yield call(tagsSagas.createTagsSaga);

    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Projects),
    );
    yield call(projectsSagas.createProjectsSaga);

    yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Tasks));
    yield call(tasksSagas.createTasksSaga);

    // TODO: Add this back in once you hash out multi-user transfers.
    // yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.UserGroups));
    // yield call(userGroupsSagas.createUserGroupsSaga);

    // yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Users));
    // yield call(usersSagas.createUsersSaga);

    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.TimeEntries),
    );
    yield call(timeEntriesSagas.createTimeEntriesSaga);

    yield put(allEntitiesActions.createAllEntities.success());
  } catch (err) {
    yield put(allEntitiesActions.createAllEntities.failure());
  }
}

/**
 * Deletes all entity records the user selected on the inclusions page. The
 * order is in reverse of the create/fetch order because we need to start with
 * the item impacted first (time entries).
 */
function* deleteAllEntitiesSaga(): SagaIterator {
  try {
    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.TimeEntries),
    );
    yield call(timeEntriesSagas.deleteTimeEntriesSaga);

    yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Tasks));
    yield call(tasksSagas.deleteTasksSaga);

    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Projects),
    );
    yield call(projectsSagas.deleteProjectsSaga);

    yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Tags));
    yield call(tagsSagas.deleteTagsSaga);

    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Clients),
    );
    yield call(clientsSagas.deleteClientsSaga);

    // TODO: Add this back in once you hash out multi-user transfers.
    // yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.UserGroups));
    // yield call(allEntitiesActions.userGroupsSagas.createUserGroupsSaga);

    // yield put(updateEntityGroupInProcess(EntityGroup.Users));
    // yield call(usersSagas.createUsersSaga);

    yield put(allEntitiesActions.deleteAllEntities.success());
  } catch (err) {
    yield put(allEntitiesActions.deleteAllEntities.failure());
  }
}

/**
 * Fetches all entities from the appropriate tools (source _and_ target for
 * transfer, only source for deletions). The fetch order is important! For
 * example, tasks _must_ be associated with a project, so if the projects
 * haven't been fetched yet, the tasks cannot be fetched.
 */
function* fetchAllEntitiesSaga(): SagaIterator {
  try {
    yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Users));
    yield call(usersSagas.fetchUsersSaga);

    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.UserGroups),
    );
    yield call(userGroupsSagas.fetchUserGroupsSaga);

    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Clients),
    );
    yield call(clientsSagas.fetchClientsSaga);

    yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Tags));
    yield call(tagsSagas.fetchTagsSaga);

    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Projects),
    );
    yield call(projectsSagas.fetchProjectsSaga);

    yield put(allEntitiesActions.updateEntityGroupInProcess(EntityGroup.Tasks));
    yield call(tasksSagas.fetchTasksSaga);

    yield put(
      allEntitiesActions.updateEntityGroupInProcess(EntityGroup.TimeEntries),
    );
    yield call(timeEntriesSagas.fetchTimeEntriesSaga);

    yield put(allEntitiesActions.fetchAllEntities.success());
  } catch (err) {
    yield put(allEntitiesActions.fetchAllEntities.failure());
  }
}
