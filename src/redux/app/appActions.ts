import { createAction } from 'redux-actions';
import capitalize from 'lodash/capitalize';
import isNil from 'lodash/isNil';
import uniqueId from 'lodash/uniqueId';
import { NotificationModel, NotificationType } from '../../types/app';
import { Dispatch } from '../rootReducer';
import { ToolName } from '../../types/common';

const getNotificationId = () => uniqueId('NTF');

export const showNotification = createAction(
  '@app/SHOW_NOTIFICATION',
  (notification: Partial<NotificationModel>) => ({
    id: isNil(notification.id) ? getNotificationId() : notification.id,
    ...notification,
  }),
);
export const dismissNotification = createAction('@app/DISMISS_NOTIFICATION');
export const hideNotifications = createAction('@app/HIDE_NOTIFICATIONS');

export const showErrorNotification = (
  error: Error & { toolName: ToolName },
) => (dispatch: Dispatch<any>): string => {
  const display = capitalize(error.toolName);
  const message = [
    `The following error occurred when making a request to the ${display} API`,
    `Error: ${error.message}`,
  ].join('\n');

  const notification = { message, type: NotificationType.Error };
  return dispatch(showNotification(notification));
};
