import type { SagaIterator } from "redux-saga";
import { all, takeEvery } from "redux-saga/effects";

import {
  toolActionChanged,
  toolNameByMappingChanged,
} from "~/modules/allEntities/allEntitiesActions";
import {
  storeCredentials,
  validateCredentials,
} from "~/modules/credentials/credentialsActions";
import { resetCredentialsSaga } from "~/modules/credentials/sagas/resetCredentialsSaga";
import { storeCredentialsSaga } from "~/modules/credentials/sagas/storeCredentialsSaga";
import { validateCredentialsSaga } from "~/modules/credentials/sagas/validateCredentialsSaga";

export function* credentialsSaga(): SagaIterator {
  yield all([
    takeEvery(storeCredentials, storeCredentialsSaga),
    takeEvery(validateCredentials.request, validateCredentialsSaga),
    takeEvery(toolNameByMappingChanged, resetCredentialsSaga),
    takeEvery(toolActionChanged, resetCredentialsSaga),
  ]);
}
