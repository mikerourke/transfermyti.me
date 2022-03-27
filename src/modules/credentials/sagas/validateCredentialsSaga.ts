import type { SagaIterator } from "redux-saga";
import { call, put, select } from "redux-saga/effects";

import { fetchObject } from "~/entityOperations/apiRequests";
import { mappingByToolNameSelector } from "~/modules/allEntities/allEntitiesSelectors";
import { validateCredentials } from "~/modules/credentials/credentialsActions";
import { credentialsByMappingSelector } from "~/modules/credentials/credentialsSelectors";
import type { TogglWorkspaceResponseModel } from "~/modules/workspaces/sagas/togglWorkspacesSagas";
import { ToolName, type ValidationErrorsByMapping } from "~/typeDefs";
import { validStringify } from "~/utilities/textTransforms";

interface TogglMeResponseModel {
  since: number;
  data: {
    id: number;
    default_wid: number;
    email: string;
    fullname: string;
    at: string;
    created_at: string;
    timezone: string;
    workspaces: TogglWorkspaceResponseModel[];
  };
}

export function* validateCredentialsSaga(): SagaIterator {
  const credentialsByMapping = yield select(credentialsByMappingSelector);
  const mappingByToolName = yield select(mappingByToolNameSelector);
  const validationErrorsByMapping: ValidationErrorsByMapping = {
    source: null,
    target: null,
  };

  let hasValidationErrors = false;

  const clockifyMapping = mappingByToolName[ToolName.Clockify];
  if (clockifyMapping) {
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
  if (togglMapping) {
    try {
      const { data }: TogglMeResponseModel = yield call(
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

  if (hasValidationErrors) {
    yield put(validateCredentials.failure(validationErrorsByMapping));
  } else {
    yield put(validateCredentials.success(credentialsByMapping));
  }
}
