import { SagaIterator } from "@redux-saga/types";
import { push } from "connected-react-router";
import * as R from "ramda";
import { call, put, select } from "redux-saga/effects";
import { fetchObject } from "~/redux/sagaUtils";
import {
  currentPathSelector,
  mappingByToolNameSelector,
} from "~/app/appSelectors";
import { validateCredentials } from "~/credentials/credentialsActions";
import {
  areApiKeysPresentSelector,
  credentialsByMappingSelector,
} from "~/credentials/credentialsSelectors";
import { TogglWorkspaceResponseModel } from "~/workspaces/sagas/togglWorkspacesSagas";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { RoutePath } from "~/app/appTypes";
import { ValidationErrorsByMappingModel } from "~/credentials/credentialsTypes";

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

  const clockifyMapping = mappingByToolName[ToolName.Clockify];
  try {
    const clockifyUser = yield call(fetchObject, "/clockify/api/v1/user");
    credentialsByMapping[clockifyMapping].email = clockifyUser.email;
    credentialsByMapping[clockifyMapping].userId = clockifyUser.id;
  } catch (err) {
    validationErrorsByMapping[clockifyMapping] = "Invalid API key";
  }

  const togglMapping = mappingByToolName[ToolName.Toggl];
  try {
    const { data }: TogglMeResponseModel = yield call(
      fetchObject,
      "/toggl/api/me",
    );
    credentialsByMapping[togglMapping].email = data.email;
    credentialsByMapping[togglMapping].userId = data.id.toString();
  } catch (err) {
    validationErrorsByMapping[togglMapping] = "Invalid API key";
  }

  const areApiKeysPresent = yield select(areApiKeysPresentSelector);
  const currentPath = yield select(currentPathSelector);
  const hasNoValidationErrors = Object.values(
    validationErrorsByMapping,
  ).every(validationError => R.isNil(validationError));
  if (
    hasNoValidationErrors &&
    areApiKeysPresent &&
    R.equals(currentPath, RoutePath.Credentials)
  ) {
    yield put(push(RoutePath.Workspaces));
    yield put(validateCredentials.success(credentialsByMapping));
  } else {
    yield put(validateCredentials.failure(validationErrorsByMapping));
  }
}