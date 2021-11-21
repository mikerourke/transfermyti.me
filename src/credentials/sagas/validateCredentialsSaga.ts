import { SagaIterator } from "@redux-saga/types";

import { call, put, select } from "redux-saga/effects";

import { mappingByToolNameSelector } from "~/allEntities/allEntitiesSelectors";
import { validateCredentials } from "~/credentials/credentialsActions";
import { credentialsByMappingSelector } from "~/credentials/credentialsSelectors";
import { fetchObject } from "~/redux/reduxUtils";
import { ToolName, ValidationErrorsByMappingModel } from "~/typeDefs";
import { validStringify } from "~/utils";
import { TogglWorkspaceResponseModel } from "~/workspaces/sagas/togglWorkspacesSagas";

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
  const validationErrorsByMapping: ValidationErrorsByMappingModel = {
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
