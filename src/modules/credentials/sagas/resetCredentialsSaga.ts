import type { SagaIterator } from "redux-saga";
import { put } from "redux-saga/effects";

import { flushCredentials } from "~/modules/credentials/credentialsActions";
import { isDevelopmentMode } from "~/utilities/environment";

/**
 * If the user changes the tool action or mapping, we don't want to keep the
 * credentials in state. The API keys may no longer apply or only one set of
 * API keys is required.
 */
export function* resetCredentialsSaga(): SagaIterator {
  if (isDevelopmentMode()) {
    return;
  }

  yield put(flushCredentials());
}
