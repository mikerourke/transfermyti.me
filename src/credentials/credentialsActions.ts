import { createAsyncAction, createAction } from "typesafe-actions";
import storage from "store";
import { isEmpty } from "lodash";
import { STORAGE_KEY } from "~/constants";
import { getIfDev } from "~/utils";
import {
  apiFetchClockifyMeDetails,
  apiFetchTogglMeDetails,
} from "~/users/usersApi";
import { selectCredentials } from "./credentialsSelectors";
import { ReduxDispatch, ReduxGetState } from "~/redux/reduxTypes";
import { CredentialsModel } from "./credentialsTypes";

export const allCredentialsStored = createAction("@credentials/STORED")<
  CredentialsModel
>();

export const credentialsValidation = createAsyncAction(
  "@credentials/CREDENTIALS_VALIDATION_REQUEST",
  "@credentials/CREDENTIALS_VALIDATION_SUCCESS",
  "@credentials/CREDENTIALS_VALIDATION_FAILURE",
)<void, CredentialsModel, void>();

export const updateAreCredentialsValid = createAction(
  "@credentials/UPDATE_ARE_CREDENTIALS_VALID",
)<boolean>();

export const updateCredentials = createAction(
  "@credentials/UPDATE_CREDENTIALS",
)<Partial<CredentialsModel>>();

export const storeAllCredentials = () => (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
): void => {
  const state = getState();

  const credentials = selectCredentials(state);

  if (getIfDev()) {
    const storedCredentials = storage.get(STORAGE_KEY) || {};
    storage.set(STORAGE_KEY, { ...storedCredentials, ...credentials });
  }

  dispatch(allCredentialsStored(credentials));
};

export const validateCredentials = (): unknown => async (
  dispatch: ReduxDispatch,
): Promise<void> => {
  dispatch(credentialsValidation.request());

  const credentials: Partial<CredentialsModel> = {
    clockifyUserId: "",
    togglEmail: "",
    togglUserId: "",
  };

  const validationErrorByTool: Record<string, string> = {};

  try {
    const { id: clockifyUserId } = await apiFetchClockifyMeDetails();
    credentials.clockifyUserId = clockifyUserId;
  } catch (err) {
    validationErrorByTool[err.toolName] = "Invalid API key";
  }

  try {
    const { data: togglData } = await apiFetchTogglMeDetails();
    credentials.togglEmail = togglData.email;
    credentials.togglUserId = togglData.id.toString();
  } catch (err) {
    validationErrorByTool[err.toolName] = "Invalid API key";
  }

  if (isEmpty(validationErrorByTool)) {
    dispatch(credentialsValidation.success(credentials));
  } else {
    dispatch(credentialsValidation.failure());
    throw validationErrorByTool;
  }
};
