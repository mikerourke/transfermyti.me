import { handleActions } from 'redux-actions';
import {
  dismissNotification,
  hideNotifications,
  showNotification,
} from './appActions';
import { NotificationModel } from '../../types/app';

export interface AppState {
  readonly notifications: NotificationModel[];
}

export const initialState: AppState = {
  notifications: [],
};

export default handleActions(
  {
    [showNotification]: (
      state: AppState,
      { payload: notification }: any,
    ): AppState => ({
      ...state,
      notifications: [...state.notifications, notification],
    }),

    [dismissNotification]: (
      state: AppState,
      { payload: notificationId }: any,
    ): AppState => ({
      ...state,
      notifications: state.notifications.filter(
        ({ id }) => id !== notificationId,
      ),
    }),

    [hideNotifications]: (state: AppState): AppState => ({
      ...state,
      notifications: [],
    }),
  },
  initialState,
);
