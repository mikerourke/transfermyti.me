import { select } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import storage from "store";
import { STORAGE_KEY } from "~/constants";
import { getIfDev } from "~/utils";
import { credentialsByMappingSelector } from "~/credentials/credentialsSelectors";

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
