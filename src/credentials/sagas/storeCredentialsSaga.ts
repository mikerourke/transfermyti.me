import { SagaIterator } from "@redux-saga/types";

import { select } from "redux-saga/effects";
import storage from "store";

import { STORAGE_KEY } from "~/constants";
import { credentialsByMappingSelector } from "~/credentials/credentialsSelectors";
import { getIfDev } from "~/utils";

export function* storeCredentialsSaga(): SagaIterator {
  const credentialsByMapping = yield select(credentialsByMappingSelector);

  if (getIfDev()) {
    const storedCredentials = storage.get(STORAGE_KEY) || {};
    storage.set(STORAGE_KEY, {
      ...storedCredentials,
      ...credentialsByMapping,
    });
  }
}
