import { SagaIterator } from "@redux-saga/types";
import { all, takeEvery } from "redux-saga/effects";
import {
  storeCredentials,
  validateCredentials,
} from "~/credentials/credentialsActions";
import { storeCredentialsSaga } from "./storeCredentialsSaga";
import { validateCredentialsSaga } from "./validateCredentialsSaga";

export function* credentialsSaga(): SagaIterator {
  yield all([
    takeEvery(storeCredentials, storeCredentialsSaga),
    takeEvery(validateCredentials.request, validateCredentialsSaga),
  ]);
}
