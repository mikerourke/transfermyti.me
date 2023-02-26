import { clone, isNil } from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import { fetchObject } from "~/entityOperations/apiRequests";
import {
  toolActionUpdated,
  toolNameByMappingUpdated,
} from "~/redux/allEntities/allEntitiesActions";
import { mappingByToolNameSelector } from "~/redux/allEntities/allEntitiesSelectors";
import * as credentialsActions from "~/redux/credentials/credentialsActions";
import { credentialsByMappingSelector } from "~/redux/credentials/credentialsSelectors";
import { mergeCredentialsInStorage } from "~/redux/credentials/credentialsStorage";
import type { TogglUserResponse } from "~/redux/users/sagas/togglUsersSagas";
import { ToolName, type ValidationErrorsByMapping } from "~/typeDefs";
import { isDevelopmentMode } from "~/utilities/environment";
import { validStringify } from "~/utilities/textTransforms";

export function* credentialsSaga(): SagaIterator {
  yield all([
    takeEvery(credentialsActions.credentialsStored, storeCredentialsSaga),
    takeEvery(
      credentialsActions.validateCredentials.request,
      validateCredentialsSaga,
    ),
    takeEvery(toolNameByMappingUpdated, resetCredentialsSaga),
    takeEvery(toolActionUpdated, resetCredentialsSaga),
  ]);
}

/**
 * If the user changes the tool action or mapping, we don't want to keep the
 * credentials in state. The API keys may no longer apply or only one set of
 * API keys is required.
 */
function* resetCredentialsSaga(): SagaIterator {
  if (isDevelopmentMode()) {
    return;
  }

  yield put(credentialsActions.credentialsFlushed());
}

function* storeCredentialsSaga(): SagaIterator {
  const credentialsByMapping = yield select(credentialsByMappingSelector);

  if (isDevelopmentMode()) {
    yield call(mergeCredentialsInStorage, credentialsByMapping);
  }
}

function* validateCredentialsSaga(): SagaIterator {
  const currentCredentialsByMapping = yield select(
    credentialsByMappingSelector,
  );

  const credentialsByMapping = clone(currentCredentialsByMapping);

  const mappingByToolName = yield select(mappingByToolNameSelector);

  const validationErrorsByMapping: ValidationErrorsByMapping = {
    source: null,
    target: null,
  };

  let hasValidationErrors = false;

  const clockifyMapping = mappingByToolName[ToolName.Clockify];
  if (!isNil(clockifyMapping)) {
    try {
      const clockifyUser = yield call(fetchObject, "/clockify/api/user");

      credentialsByMapping[clockifyMapping].email = clockifyUser.email;

      credentialsByMapping[clockifyMapping].userId = clockifyUser.id;
    } catch {
      validationErrorsByMapping[clockifyMapping] = "Invalid API key";

      hasValidationErrors = true;
    }
  }

  const togglMapping = mappingByToolName[ToolName.Toggl];
  if (!isNil(togglMapping)) {
    try {
      const me: TogglUserResponse = yield call(fetchObject, "/toggl/api/me");

      credentialsByMapping[togglMapping].email = me.email;

      credentialsByMapping[togglMapping].userId = validStringify(me?.id, null);
    } catch {
      validationErrorsByMapping[togglMapping] = "Invalid API key";

      hasValidationErrors = true;
    }
  }

  // prettier-ignore
  if (hasValidationErrors) {
    yield put(credentialsActions.validateCredentials.failure(validationErrorsByMapping));
  } else {
    yield put(credentialsActions.validateCredentials.success(credentialsByMapping));
  }
}
