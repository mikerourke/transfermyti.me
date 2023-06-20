import type { SagaIterator } from "redux-saga";
import { spawn } from "redux-saga/effects";

import { allEntitiesSaga } from "~/redux/allEntities/allEntities.saga";
import { credentialsSaga } from "~/redux/credentials/credentials.saga";
import { projectMonitoringSaga } from "~/redux/projects/sagas/projects.sagas";
import { taskMonitoringSaga } from "~/redux/tasks/sagas/tasks.sagas";
import { workspacesSaga } from "~/redux/workspaces/sagas/workspaces.saga";

export function* rootSagas(): SagaIterator {
  yield spawn(allEntitiesSaga);
  yield spawn(credentialsSaga);
  yield spawn(projectMonitoringSaga);
  yield spawn(taskMonitoringSaga);
  yield spawn(workspacesSaga);
}
