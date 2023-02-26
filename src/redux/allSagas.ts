import type { SagaIterator } from "redux-saga";
import { spawn } from "redux-saga/effects";

import { allEntitiesSaga } from "~/redux/allEntities/allEntitiesSaga";
import { credentialsSaga } from "~/redux/credentials/credentialsSaga";
import { projectMonitoringSaga } from "~/redux/projects/sagas/projectsSagas";
import { taskMonitoringSaga } from "~/redux/tasks/sagas/tasksSagas";
import { workspacesSaga } from "~/redux/workspaces/sagas/workspacesSaga";

export function* allSagas(): SagaIterator {
  yield spawn(allEntitiesSaga);
  yield spawn(credentialsSaga);
  yield spawn(projectMonitoringSaga);
  yield spawn(taskMonitoringSaga);
  yield spawn(workspacesSaga);
}
