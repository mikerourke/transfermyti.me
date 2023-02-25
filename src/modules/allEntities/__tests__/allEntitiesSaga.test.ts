import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { describe, test, vi } from "vitest";

import * as allEntitiesActions from "~/modules/allEntities/allEntitiesActions";
import * as clientsSagas from "~/modules/clients/sagas/clientsSagas";
import * as projectsSagas from "~/modules/projects/sagas/projectsSagas";
import * as tagsSagas from "~/modules/tags/sagas/tagsSagas";
import * as tasksSagas from "~/modules/tasks/sagas/tasksSagas";
import * as timeEntriesSagas from "~/modules/timeEntries/sagas/timeEntriesSagas";
import { EntityGroup } from "~/typeDefs";

import { allEntitiesSaga } from "../allEntitiesSaga";

vi.mock("~/modules/app/workflowStep");
vi.mock("~/utilities/environment");

describe("within allEntitiesSaga", () => {
  test("the createAllEntitiesSaga dispatches the correct actions", () => {
    return expectSaga(allEntitiesSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Clients))
      .call(clientsSagas.createClientsSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tags))
      .call(tagsSagas.createTagsSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Projects))
      .call(projectsSagas.createProjectsSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tasks))
      .call(tasksSagas.createTasksSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.TimeEntries))
      .call(timeEntriesSagas.createTimeEntriesSaga)
      .put(allEntitiesActions.createAllEntities.success())
      .dispatch(allEntitiesActions.createAllEntities.request())
      .silentRun();
  });

  test("dispatches createAllEntities.failure action if an error is thrown when creating", () => {
    const error = new Error("error");

    return expectSaga(allEntitiesSaga)
      .provide([[matchers.call.fn(clientsSagas.createClientsSaga), throwError(error)]])
      .put(allEntitiesActions.createAllEntities.failure())
      .dispatch(allEntitiesActions.createAllEntities.request())
      .silentRun();
  });

  test("the deleteAllEntitiesSaga dispatches the correct actions", () => {
    return expectSaga(allEntitiesSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.TimeEntries))
      .call(timeEntriesSagas.deleteTimeEntriesSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tasks))
      .call(tasksSagas.deleteTasksSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Projects))
      .call(projectsSagas.deleteProjectsSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tags))
      .call(tagsSagas.deleteTagsSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Clients))
      .call(clientsSagas.deleteClientsSaga)
      .put(allEntitiesActions.deleteAllEntities.success())
      .dispatch(allEntitiesActions.deleteAllEntities.request())
      .silentRun();
  });

  test("dispatches deleteAllEntities.failure action if an error is thrown when deleting", () => {
    const error = new Error("error");

    return expectSaga(allEntitiesSaga)
      .provide([[matchers.call.fn(timeEntriesSagas.deleteTimeEntriesSaga), throwError(error)]])
      .put(allEntitiesActions.deleteAllEntities.failure())
      .dispatch(allEntitiesActions.deleteAllEntities.request())
      .silentRun();
  });

  test("the fetchAllEntitiesSaga dispatches the correct actions", () => {
    return expectSaga(allEntitiesSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Clients))
      .call(clientsSagas.fetchClientsSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tags))
      .call(tagsSagas.fetchTagsSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Projects))
      .call(projectsSagas.fetchProjectsSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Tasks))
      .call(tasksSagas.fetchTasksSaga)
      .put(allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.TimeEntries))
      .call(timeEntriesSagas.fetchTimeEntriesSaga)
      .put(allEntitiesActions.fetchAllEntities.success())
      .dispatch(allEntitiesActions.fetchAllEntities.request())
      .silentRun();
  });

  test("dispatches fetchAllEntities.failure action if an error is thrown when fetching", () => {
    const error = new Error("error");

    return expectSaga(allEntitiesSaga)
      .provide([[matchers.call.fn(clientsSagas.fetchClientsSaga), throwError(error)]])
      .put(allEntitiesActions.fetchAllEntities.failure())
      .dispatch(allEntitiesActions.fetchAllEntities.request())
      .silentRun();
  });
});
