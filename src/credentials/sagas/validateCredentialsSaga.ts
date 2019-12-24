import { call, put } from "redux-saga/effects";
import { push } from "connected-react-router";
import { isEmpty } from "lodash";
import { fetchObject } from "~/utils";
import { validateCredentials } from "~/credentials/credentialsActions";
import { CredentialsModel } from "~/credentials/credentialsTypes";
import { ClockifyUserModel } from "~/users/usersTypes";
import { TogglWorkspaceModel } from "~/workspaces/workspacesTypes";
import { RoutePath } from "~/app/appTypes";

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
    workspaces: TogglWorkspaceModel[];
  };
}

export function* validateCredentialsSaga(): Generator {
  const credentials: Partial<CredentialsModel> = {
    clockifyUserId: "",
    togglEmail: "",
    togglUserId: "",
  };

  const validationErrorByTool: Record<string, string> = {};

  try {
    const apiResponse = yield call(fetchObject, "/clockify/api/v1/user");
    const { id: clockifyUserId } = apiResponse as ClockifyUserModel;
    credentials.clockifyUserId = clockifyUserId;
  } catch (err) {
    validationErrorByTool[err.toolName] = "Invalid API key";
  }

  try {
    const apiResponse = yield call(fetchObject, "/toggl/api/me");
    const { data } = apiResponse as TogglMeResponseModel;
    credentials.togglEmail = data.email;
    credentials.togglUserId = data.id.toString();
  } catch (err) {
    validationErrorByTool[err.toolName] = "Invalid API key";
  }

  if (isEmpty(validationErrorByTool)) {
    yield put(push(RoutePath.Workspaces));
    yield put(validateCredentials.success(credentials));
  } else {
    yield put(validateCredentials.failure(validationErrorByTool));
  }
}
