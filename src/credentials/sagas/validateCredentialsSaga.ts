import { call, put } from "redux-saga/effects";
import { push } from "connected-react-router";
import R from "ramda";
import { SagaIterator } from "@redux-saga/types";
import { fetchObject } from "~/utils";
import { TogglWorkspaceResponseModel } from "~/workspaces/sagas/togglWorkspacesSaga";
import { validateCredentials } from "~/credentials/credentialsActions";
import { RoutePath } from "~/app/appTypes";
import { CredentialsModel } from "~/credentials/credentialsTypes";

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
  const credentials: Partial<CredentialsModel> = {
    clockifyUserId: "",
    togglEmail: "",
    togglUserId: "",
  };

  const validationErrorByTool: Record<string, string> = {};

  try {
    const clockifyUser = yield call(fetchObject, "/clockify/api/v1/user");
    credentials.clockifyUserId = clockifyUser.id;
  } catch (err) {
    validationErrorByTool[err.toolName] = "Invalid API key";
  }

  try {
    const togglUser: TogglMeResponseModel = yield call(
      fetchObject,
      "/toggl/api/me",
    );
    credentials.togglEmail = togglUser.data.email;
    credentials.togglUserId = togglUser.data.id.toString();
  } catch (err) {
    validationErrorByTool[err.toolName] = "Invalid API key";
  }

  if (R.isEmpty(validationErrorByTool)) {
    yield put(push(RoutePath.Workspaces));
    yield put(validateCredentials.success(credentials));
  } else {
    yield put(validateCredentials.failure(validationErrorByTool));
  }
}
