import { createAction } from 'redux-actions';
import capitalize from 'lodash/capitalize';
import isNil from 'lodash/isNil';
import uniqueId from 'lodash/uniqueId';
import { NotificationModel, NotificationType } from '../../types/appTypes';
import { ToolName } from '../../types/commonTypes';
import { Dispatch } from '../rootReducer';

const getNotificationId = () => uniqueId('NTF');

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
  dispatch: Dispatch<any>,
) => {
  const id = isNil(notification.id) ? getNotificationId() : notification.id;
  dispatch(notificationShown({ ...notification, id }));
  return id;
};

export const showFetchErrorNotification = (
  error: Error & { toolName: ToolName },
) => (dispatch: Dispatch<any>): string => {
  console.log(error);
  const name = capitalize(error.toolName);
  const message = `An error occurred when making a request to the ${name} API`;

  const notification = { message, type: NotificationType.Error };
  return dispatch(showNotification(notification));
};
