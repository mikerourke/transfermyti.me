import { createStandardAction } from 'typesafe-actions';
import { capitalize, isNil, uniqueId } from 'lodash';
import { getIfDev } from '~/utils/getIfDev';
import {
  CompoundWorkspaceModel,
  InTransferDetailsModel,
  NotificationModel,
  NotificationType,
  ReduxDispatch,
  ToolName,
  TransferType,
} from '~/types';

export const notificationShown = createStandardAction(
  '@app/NOTIFICATION_SHOWN',
)<Partial<NotificationModel>>();

export const dismissNotification = createStandardAction(
  '@app/DISMISS_NOTIFICATION',
)<string>();

export const dismissAllNotifications = createStandardAction(
  '@app/DISMISS_ALL_NOTIFICATIONS',
)();

export const updateTransferType = createStandardAction(
  '@app/UPDATE_TRANSFER_TYPE',
)<TransferType>();

export const updateInTransferWorkspace = createStandardAction(
  '@app/UPDATE_IN_TRANSFER_WORKSPACE',
)<CompoundWorkspaceModel | null>();

export const updateInTransferDetails = createStandardAction(
  '@app/UPDATE_IN_TRANSFER_DETAILS',
)<InTransferDetailsModel>();

export const showNotification = (notification: Partial<NotificationModel>) => (
  dispatch: ReduxDispatch,
) => {
  const id = isNil(notification.id) ? uniqueId('NTF') : notification.id;
  dispatch(notificationShown({ ...notification, id }));
  return id;
};

export const showFetchErrorNotification = (
  error: Error & { toolName: ToolName },
) => (dispatch: ReduxDispatch): string => {
  if (getIfDev()) console.error(error);

  const name = capitalize(error.toolName);
  const message = `An error occurred when making a request to the ${name} API`;

  const notification = { message, type: NotificationType.Error };
  return dispatch(showNotification(notification));
};
