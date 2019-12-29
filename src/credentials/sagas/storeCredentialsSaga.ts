import { put, select } from "redux-saga/effects";
import storage from "store";
import { STORAGE_KEY } from "~/constants";
import { getIfDev } from "~/utils";
import { storeCredentials } from "~/credentials/credentialsActions";
import { credentialsSelector } from "~/credentials/credentialsSelectors";
import { CredentialsModel } from "~/credentials/credentialsTypes";

export function* storeCredentialsSaga(): Generator {
  const credentials = yield select(credentialsSelector);

  if (getIfDev()) {
    const storedCredentials = storage.get(STORAGE_KEY) || {};
    storage.set(STORAGE_KEY, {
      ...storedCredentials,
      ...(credentials as CredentialsModel),
    });
  }

  yield put(storeCredentials.success(credentials as CredentialsModel));
}
