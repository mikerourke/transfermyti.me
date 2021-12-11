import type { SagaIterator } from "redux-saga";
import { all, takeEvery } from "redux-saga/effects";

import {
  updateToolAction,
  updateToolNameByMapping,
} from "~/allEntities/allEntitiesActions";

import {
  storeCredentials,
  validateCredentials,
} from "~/credentials/credentialsActions";

import { resetCredentialsSaga } from "./resetCredentialsSaga";
import { storeCredentialsSaga } from "./storeCredentialsSaga";
import { validateCredentialsSaga } from "./validateCredentialsSaga";

export function* credentialsSaga(): SagaIterator {
  yield all([
    takeEvery(storeCredentials, storeCredentialsSaga),
    takeEvery(validateCredentials.request, validateCredentialsSaga),
    takeEvery(updateToolNameByMapping, resetCredentialsSaga),
    takeEvery(updateToolAction, resetCredentialsSaga),
  ]);
}
