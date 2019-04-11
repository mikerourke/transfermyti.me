import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { capitalize, first, set } from 'lodash';
import storage from 'store';
import { STORAGE_KEY } from '~/constants';
import { getIfDev } from '~/utils/getIfDev';
import {
  apiFetchClockifyUserDetails,
  apiFetchTogglMeDetails,
} from '~/redux/entities/api/users';
import { apiFetchClockifyWorkspaces } from '~/redux/entities/api/workspaces';
import { selectCredentials } from './credentialsSelectors';
import { showNotification } from '~/redux/app/appActions';
import {
  clockifyWorkspacesFetch,
  togglWorkspacesFetch,
} from '~/redux/entities/workspaces/workspacesActions';
import { NotificationType } from '~/types/appTypes';
import { ReduxDispatch, ReduxGetState, ToolName } from '~/types/commonTypes';
import { CredentialsField, CredentialsModel } from '~/types/credentialsTypes';

export const allCredentialsStored = createStandardAction('@credentials/STORED')<
  CredentialsModel
>();

export const credentialsValidation = createAsyncAction(
  '@credentials/CREDENTIALS_VALIDATION_REQUEST',
  '@credentials/CREDENTIALS_VALIDATION_SUCCESS',
  '@credentials/CREDENTIALS_VALIDATION_FAILURE',
)<void, CredentialsModel, void>();

export const updateCredentialsField = createStandardAction(
  '@credentials/UPDATE_FIELD',
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

const fetchClockifyUserDetails = () => async (dispatch: ReduxDispatch) => {
  const workspaces = await apiFetchClockifyWorkspaces();
  dispatch(clockifyWorkspacesFetch.success(workspaces));

  const validMemberships = first(workspaces).memberships.filter(
    ({ membershipType }) => membershipType === 'WORKSPACE',
  );

  if (validMemberships.length === 0) {
    const userError = new Error('No memberships found for user');
    set(userError, 'toolName', ToolName.Clockify);
    throw userError;
  }

  const [{ userId }] = validMemberships;
  const { id } = await apiFetchClockifyUserDetails(userId);
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

export const validateCredentials = () => async (dispatch: ReduxDispatch) => {
  dispatch(credentialsValidation.request());

  try {
    const { togglEmail, togglUserId } = await dispatch(fetchTogglMeDetails());
    const clockifyUserId = await dispatch(fetchClockifyUserDetails());

    const credentials = {
      [CredentialsField.ClockifyUserId]: clockifyUserId,
      [CredentialsField.TogglEmail]: togglEmail,
      [CredentialsField.TogglUserId]: togglUserId,
    };

    return dispatch(credentialsValidation.success(credentials));
  } catch (error) {
    const message =
      'An error occurred when attempting to validate your ' +
      `${capitalize(error.toolName)} credentials.`;
    dispatch(showNotification({ message, type: NotificationType.Error }));
    return dispatch(credentialsValidation.failure());
  }
};
