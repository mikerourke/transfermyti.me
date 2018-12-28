import { handleActions } from 'redux-actions';
import {
  dismissNotification,
  dismissAllNotifications,
  notificationShown,
} from './appActions';
import { NotificationModel } from '../../types/appTypes';

export interface AppState {
  readonly notifications: NotificationModel[];
  readonly activeWorkspaceId: string;
}

export const initialState: AppState = {
  notifications: [],
  activeWorkspaceId: '',
};

export default handleActions(
  {
    [notificationShown]: (
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

    [dismissAllNotifications]: (state: AppState): AppState => ({
      ...state,
      notifications: [],
    }),
  },
  initialState,
);
