import { createAction } from 'redux-actions';
import storage from 'store';
import capitalize from 'lodash/capitalize';
import first from 'lodash/first';
import set from 'lodash/set';
import getIfDev from '../../utils/getIfDev';
import { STORAGE_KEY } from '../../constants';
import {
  apiFetchClockifyUserDetails,
  apiFetchTogglUserDetails,
} from '../entities/api/users';
import { apiFetchClockifyWorkspaces } from '../entities/api/workspaces';
import { selectCredentials } from './credentialsSelectors';
import { showNotification } from '../app/appActions';
import {
  clockifyWorkspacesFetchSuccess,
  togglWorkspacesFetchSuccess,
} from '../entities/workspaces/workspacesActions';
import {
  CredentialsField,
  CredentialsModel,
} from '../../types/credentialsTypes';
import { NotificationType } from '../../types/appTypes';
import { ToolName } from '../../types/commonTypes';
import { Dispatch, GetState } from '../rootReducer';

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
  dispatch: Dispatch<any>,
  getState: GetState,
) => {
  const state = getState();

  const credentials = selectCredentials(state);

  if (getIfDev()) {
    const storedCredentials = storage.get(STORAGE_KEY) || {};
    storage.set(STORAGE_KEY, { ...storedCredentials, ...credentials });
  }

  return dispatch(allCredentialsStored(credentials));
};

const fetchClockifyUserDetails = () => async (dispatch: Dispatch<any>) => {
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

const fetchTogglUserDetails = () => async (dispatch: Dispatch<any>) => {
  const { data } = await apiFetchTogglUserDetails();
  dispatch(togglWorkspacesFetchSuccess(data.workspaces));
  return data.email;
};

export const validateCredentials = () => async (dispatch: Dispatch<any>) => {
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
