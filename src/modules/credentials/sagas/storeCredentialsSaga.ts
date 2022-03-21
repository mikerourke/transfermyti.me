import type { SagaIterator } from "redux-saga";
import { select } from "redux-saga/effects";
import storage from "store";

import { STORAGE_KEY } from "~/constants";
import { credentialsByMappingSelector } from "~/modules/credentials/credentialsSelectors";
import { isDevelopmentMode } from "~/utilities/environment";

export function* storeCredentialsSaga(): SagaIterator {
  const credentialsByMapping = yield select(credentialsByMappingSelector);

  if (isDevelopmentMode()) {
    const storedCredentials = storage.get(STORAGE_KEY) || {};
    storage.set(STORAGE_KEY, {
      ...storedCredentials,
      ...credentialsByMapping,
    });
  }
}
