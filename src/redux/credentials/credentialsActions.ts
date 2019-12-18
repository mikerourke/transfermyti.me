import { createAsyncAction, createAction } from "typesafe-actions";
import { capitalize } from "lodash";
import storage from "store";
import { STORAGE_KEY } from "~/constants";
import { getIfDev } from "~/utils/getIfDev";
import {
  apiFetchClockifyMeDetails,
  apiFetchTogglMeDetails,
} from "~/redux/entities/api/users";
import { apiFetchClockifyWorkspaces } from "~/redux/entities/api/workspaces";
import { selectCredentials } from "./credentialsSelectors";
import { showNotification } from "~/redux/app/appActions";
import {
  clockifyWorkspacesFetch,
  togglWorkspacesFetch,
} from "~/redux/entities/workspaces/workspacesActions";
import {
  CredentialsField,
  CredentialsModel,
  NotificationType,
  ReduxDispatch,
  ReduxGetState,
} from "~/types";

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

export const updateCredentialsField = createAction(
  "@credentials/UPDATE_FIELD",
)<{ field: CredentialsField; value: string }>();

export const storeAllCredentials = () => (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  const state = getState();

  const credentials = selectCredentials(state);

  if (getIfDev()) {
    const storedCredentials = storage.get(STORAGE_KEY) || {};
    storage.set(STORAGE_KEY, { ...storedCredentials, ...credentials });
  }

  return dispatch(allCredentialsStored(credentials));
};

const fetchClockifyMeDetails = () => async (dispatch: ReduxDispatch) => {
  const workspaces = await apiFetchClockifyWorkspaces();
  dispatch(clockifyWorkspacesFetch.success(workspaces));

  const { id } = await apiFetchClockifyMeDetails();
  return id;
};

const fetchTogglMeDetails = () => async (dispatch: ReduxDispatch) => {
  const { data } = await apiFetchTogglMeDetails();
  dispatch(togglWorkspacesFetch.success(data.workspaces));

  return {
    togglEmail: data.email,
    togglUserId: data.id.toString(),
  };
};

export const validateCredentials = (): unknown => async (
  dispatch: ReduxDispatch,
): Promise<void> => {
  dispatch(credentialsValidation.request());

  try {
    const { togglEmail, togglUserId } = await dispatch(fetchTogglMeDetails());
    const clockifyUserId = await dispatch(fetchClockifyMeDetails());

    const credentials = {
      [CredentialsField.ClockifyUserId]: clockifyUserId,
      [CredentialsField.TogglEmail]: togglEmail,
      [CredentialsField.TogglUserId]: togglUserId,
    };

    dispatch(credentialsValidation.success(credentials));
  } catch (err) {
    const message =
      "An error occurred when attempting to validate your " +
      `${capitalize(err.toolName)} credentials.`;
    dispatch(showNotification({ message, type: NotificationType.Error }));
    dispatch(credentialsValidation.failure());
  }
};
