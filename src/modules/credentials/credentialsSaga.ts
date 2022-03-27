import { isNil } from "ramda";
import type { SagaIterator } from "redux-saga";
import { all, call, put, select, takeEvery } from "redux-saga/effects";

import { fetchObject } from "~/entityOperations/apiRequests";
import {
  toolActionUpdated,
  toolNameByMappingUpdated,
} from "~/modules/allEntities/allEntitiesActions";
import { mappingByToolNameSelector } from "~/modules/allEntities/allEntitiesSelectors";
import * as credentialsActions from "~/modules/credentials/credentialsActions";
import { credentialsByMappingSelector } from "~/modules/credentials/credentialsSelectors";
import { mergeCredentialsInStorage } from "~/modules/credentials/credentialsStorage";
import type { TogglWorkspaceResponse } from "~/modules/workspaces/sagas/togglWorkspacesSagas";
import { ToolName, ValidationErrorsByMapping } from "~/typeDefs";
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

interface TogglMeResponse {
  since: number;
  data: {
    id: number;
    default_wid: number;
    email: string;
    fullname: string;
    at: string;
    created_at: string;
    timezone: string;
    workspaces: TogglWorkspaceResponse[];
  };
}

function* validateCredentialsSaga(): SagaIterator {
  const credentialsByMapping = yield select(credentialsByMappingSelector);

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
      const { data }: TogglMeResponse = yield call(
        fetchObject,
        "/toggl/api/me",
      );

      credentialsByMapping[togglMapping].email = data.email;

      credentialsByMapping[togglMapping].userId = validStringify(
        data?.id,
        null,
      );
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
