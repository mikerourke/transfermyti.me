import { all, takeEvery } from "redux-saga/effects";
import {
  storeCredentials,
  validateCredentials,
} from "~/credentials/credentialsActions";
import { storeCredentialsSaga } from "./storeCredentialsSaga";
import { validateCredentialsSaga } from "./validateCredentialsSaga";

export function* credentialsSaga(): Generator {
  yield all([
    takeEvery(storeCredentials.request, storeCredentialsSaga),
    takeEvery(validateCredentials.request, validateCredentialsSaga),
  ]);
}
