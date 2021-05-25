import { SagaIterator } from "@redux-saga/types";

import { all, takeEvery } from "redux-saga/effects";

import { resetCredentialsSaga } from "./resetCredentialsSaga";
import { storeCredentialsSaga } from "./storeCredentialsSaga";
import { validateCredentialsSaga } from "./validateCredentialsSaga";
import {
  updateToolAction,
  updateToolNameByMapping,
} from "~/allEntities/allEntitiesActions";
import {
  storeCredentials,
  validateCredentials,
} from "~/credentials/credentialsActions";

export function* credentialsSaga(): SagaIterator {
  yield all([
    takeEvery(storeCredentials, storeCredentialsSaga),
    takeEvery(validateCredentials.request, validateCredentialsSaga),
    takeEvery(updateToolNameByMapping, resetCredentialsSaga),
    takeEvery(updateToolAction, resetCredentialsSaga),
  ]);
}
