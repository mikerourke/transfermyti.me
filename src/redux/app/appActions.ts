import { createStandardAction } from 'typesafe-actions';
import { capitalize, isNil, uniqueId } from 'lodash';
import getIfDev from '~/utils/getIfDev';
import {
  NotificationModel,
  NotificationType,
  TransferType,
} from '~/types/appTypes';
import { EntityModel, ReduxDispatch, ToolName } from '~/types/commonTypes';

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

export const updateInTransferEntity = createStandardAction(
  '@app/UPDATE_IN_TRANSFER_ENTITY',
)<Partial<EntityModel>>();

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
  if (getIfDev()) console.log(error);

  const name = capitalize(error.toolName);
  const message = `An error occurred when making a request to the ${name} API`;

  const notification = { message, type: NotificationType.Error };
  return dispatch(showNotification(notification));
};
