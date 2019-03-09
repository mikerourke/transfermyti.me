import { createAction } from 'redux-actions';
import capitalize from 'lodash/capitalize';
import first from 'lodash/first';
import set from 'lodash/set';
import storage from 'store';
import { STORAGE_KEY } from '~/constants';
import getIfDev from '~/utils/getIfDev';
import {
  apiFetchClockifyUserDetails,
  apiFetchTogglUserDetails,
} from '~/redux/entities/api/users';
import { apiFetchClockifyWorkspaces } from '~/redux/entities/api/workspaces';
import { selectCredentials } from './credentialsSelectors';
import { showNotification } from '~/redux/app/appActions';
import {
  clockifyWorkspacesFetchSuccess,
  togglWorkspacesFetchSuccess,
} from '~/redux/entities/workspaces/workspacesActions';
import { NotificationType } from '~/types/appTypes';
import { ReduxDispatch, ReduxGetState, ToolName } from '~/types/commonTypes';
import { CredentialsField, CredentialsModel } from '~/types/credentialsTypes';

export const allCredentialsStored = createAction(
  '@credentials/STORED',
  (credentials: CredentialsModel) => credentials,
);
export const credentialsValidationStarted = createAction(
  '@credentials/VALIDATION_STARTED',
);
export const credentialsValidationSuccess = createAction(
  '@credentials/VALIDATION_SUCCESS',
  (credentials: CredentialsModel) => credentials,
);
export const credentialsValidationFailure = createAction(
  '@credentials/VALIDATION_FAILURE',
);
export const updateCredentialsField = createAction(
  '@credentials/UPDATE_FIELD',
  (field: CredentialsField, value: string) => ({ field, value }),
);

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
  dispatch(clockifyWorkspacesFetchSuccess(workspaces));

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

const fetchTogglUserDetails = () => async (dispatch: ReduxDispatch) => {
  const { data } = await apiFetchTogglUserDetails();
  dispatch(togglWorkspacesFetchSuccess(data.workspaces));
  return data.email;
};

export const validateCredentials = () => async (dispatch: ReduxDispatch) => {
  dispatch(credentialsValidationStarted());
  try {
    const togglEmail = await dispatch(fetchTogglUserDetails());
    const clockifyUserId = await dispatch(fetchClockifyUserDetails());

    const credentials = {
      [CredentialsField.ClockifyUserId]: clockifyUserId,
      [CredentialsField.TogglEmail]: togglEmail,
    };

    return dispatch(credentialsValidationSuccess(credentials));
  } catch (error) {
    const message =
      'An error occurred when attempting to validate your ' +
      `${capitalize(error.toolName)} credentials.`;
    dispatch(showNotification({ message, type: NotificationType.Error }));
    return dispatch(credentialsValidationFailure());
  }
};
