import type { SagaIterator } from "redux-saga";
import { all, takeEvery } from "redux-saga/effects";

import {
  toolActionUpdated,
  toolNameByMappingUpdated,
} from "~/modules/allEntities/allEntitiesActions";
import {
  credentialsStored,
  validateCredentials,
} from "~/modules/credentials/credentialsActions";
import { resetCredentialsSaga } from "~/modules/credentials/sagas/resetCredentialsSaga";
import { storeCredentialsSaga } from "~/modules/credentials/sagas/storeCredentialsSaga";
import { validateCredentialsSaga } from "~/modules/credentials/sagas/validateCredentialsSaga";

export function* credentialsSaga(): SagaIterator {
  yield all([
    takeEvery(credentialsStored, storeCredentialsSaga),
    takeEvery(validateCredentials.request, validateCredentialsSaga),
    takeEvery(toolNameByMappingUpdated, resetCredentialsSaga),
    takeEvery(toolActionUpdated, resetCredentialsSaga),
  ]);
}
