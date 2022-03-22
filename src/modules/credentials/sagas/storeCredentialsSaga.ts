import type { SagaIterator } from "redux-saga";
import { call, select } from "redux-saga/effects";

import { credentialsByMappingSelector } from "~/modules/credentials/credentialsSelectors";
import { mergeCredentialsInStorage } from "~/modules/credentials/credentialsStorage";
import { isDevelopmentMode } from "~/utilities/environment";

export function* storeCredentialsSaga(): SagaIterator {
  const credentialsByMapping = yield select(credentialsByMappingSelector);

  if (isDevelopmentMode()) {
    yield call(mergeCredentialsInStorage, credentialsByMapping);
  }
}
