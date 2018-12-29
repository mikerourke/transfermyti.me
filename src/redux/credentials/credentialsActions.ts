import { createAction } from 'redux-actions';
import capitalize from 'lodash/capitalize';
import { updateStorage } from '../../utils/storageUtils';
import { showNotification } from '../app/appActions';
import { selectCredentials } from './credentialsSelectors';
import {
  fetchClockifyUserDetails,
  fetchTogglUserDetails,
} from '../entities/user/userActions';
import { NotificationType } from '../../types/appTypes';
import { CredentialsField } from '../../types/credentialsTypes';
import { Dispatch, GetState } from '../rootReducer';

export const allCredentialsStored = createAction('@credentials/STORED');
export const credentialsValidationStarted = createAction(
  '@credentials/VALIDATION_STARTED',
);
export const credentialsValidationSuccess = createAction(
  '@credentials/VALIDATION_SUCCESS',
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
  const credentials = selectCredentials(getState());
  updateStorage(credentials);
  return dispatch(allCredentialsStored(credentials));
};

export const validateCredentials = () => async (dispatch: Dispatch<any>) => {
  dispatch(credentialsValidationStarted());
  try {
    await dispatch(fetchTogglUserDetails());
    await dispatch(fetchClockifyUserDetails());
    return dispatch(credentialsValidationSuccess());
  } catch (error) {
    const message =
      'An error occurred when attempting to validate your ' +
      `${capitalize(error.toolName)} credentials.`;
    dispatch(showNotification({ message, type: NotificationType.Error }));
    return dispatch(credentialsValidationFailure());
  }
};
