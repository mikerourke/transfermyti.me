import { createAction } from 'redux-actions';
import { capitalize, isNil, uniqueId } from 'lodash';
import getIfDev from '~/utils/getIfDev';
import { NotificationModel, NotificationType } from '~/types/appTypes';
import { ReduxDispatch, ToolName } from '~/types/commonTypes';

export const notificationShown = createAction(
  '@app/NOTIFICATION_SHOWN',
  (notification: NotificationModel) => notification,
);
export const dismissNotification = createAction(
  '@app/DISMISS_NOTIFICATION',
  (notificationId: string) => notificationId,
);
export const dismissAllNotifications = createAction(
  '@app/DISMISS_ALL_NOTIFICATIONS',
);

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
