import type { SagaIterator } from "redux-saga";
import { all, call, put, takeEvery } from "redux-saga/effects";

import * as allEntitiesActions from "~/redux/allEntities/allEntities.actions";
import * as clientsSagas from "~/redux/clients/sagas/clients.sagas";
import * as projectsSagas from "~/redux/projects/sagas/projects.sagas";
import * as tagsSagas from "~/redux/tags/sagas/tags.sagas";
import * as tasksSagas from "~/redux/tasks/sagas/tasks.sagas";
import * as timeEntriesSagas from "~/redux/timeEntries/sagas/timeEntries.sagas";
import * as userGroupsSagas from "~/redux/userGroups/sagas/userGroups.sagas";
import * as usersSagas from "~/redux/users/sagas/users.sagas";
import { EntityGroup } from "~/types";

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
  // prettier-ignore
  try {
    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Clients));
    yield call(clientsSagas.createClientsSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tags));
    yield call(tagsSagas.createTagsSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Projects));
    yield call(projectsSagas.createProjectsSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tasks));
    yield call(tasksSagas.createTasksSaga);

    // TODO: Add this back in once you hash out multi-user transfers.
    // yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.UserGroups));
    // yield call(userGroupsSagas.createUserGroupsSaga);

    // yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Users));
    // yield call(usersSagas.createUsersSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.TimeEntries));
    yield call(timeEntriesSagas.createTimeEntriesSaga);

    yield put(allEntitiesActions.createAllEntities.success());
  } catch (err: AnyValid) {
    yield put(allEntitiesActions.createAllEntities.failure());
  }
}

/**
 * Deletes all entity records the user selected on the inclusions page. The
 * order is in reverse of the create/fetch order because we need to start with
 * the item impacted first (time entries).
 */
function* deleteAllEntitiesSaga(): SagaIterator {
  // prettier-ignore
  try {
    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.TimeEntries));
    yield call(timeEntriesSagas.deleteTimeEntriesSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tasks));
    yield call(tasksSagas.deleteTasksSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Projects));
    yield call(projectsSagas.deleteProjectsSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tags));
    yield call(tagsSagas.deleteTagsSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Clients));
    yield call(clientsSagas.deleteClientsSaga);

    // TODO: Add this back in once you hash out multi-user transfers.
    // yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.UserGroups));
    // yield call(allEntitiesActions.userGroupsSagas.createUserGroupsSaga);

    // yield put(entityGroupInProcessUpdated(EntityGroup.Users));
    // yield call(usersSagas.createUsersSaga);

    yield put(allEntitiesActions.deleteAllEntities.success());
  } catch (err: AnyValid) {
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
  // prettier-ignore
  try {
    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Users));
    yield call(usersSagas.fetchUsersSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.UserGroups));
    yield call(userGroupsSagas.fetchUserGroupsSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Clients));
    yield call(clientsSagas.fetchClientsSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tags));
    yield call(tagsSagas.fetchTagsSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Projects));
    yield call(projectsSagas.fetchProjectsSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tasks));
    yield call(tasksSagas.fetchTasksSaga);

    yield put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.TimeEntries));
    yield call(timeEntriesSagas.fetchTimeEntriesSaga);

    yield put(allEntitiesActions.fetchAllEntities.success());
  } catch (err: AnyValid) {
    yield put(allEntitiesActions.fetchAllEntities.failure());
  }
}
