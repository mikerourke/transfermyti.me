import { getType } from 'typesafe-actions';
import { handleActions } from 'redux-actions';
import * as appActions from './appActions';
import {
  NotificationModel,
  ReduxAction,
  TransferDetailsModel,
  TransferType,
} from '~/types';

export interface AppState {
  readonly notifications: Array<NotificationModel>;
  readonly currentTransferType: TransferType;
  readonly transferDetails: TransferDetailsModel;
}

export const initialState: AppState = {
  notifications: [],
  currentTransferType: TransferType.SingleUser,
  transferDetails: {
    countCurrent: 0,
    countTotal: 0,
    inTransferEntity: null,
  },
};

export const appReducer = handleActions(
  {
    [getType(appActions.notificationShown)]: (
      state: AppState,
      { payload: notification }: ReduxAction<NotificationModel>,
    ): AppState => ({
      ...state,
      notifications: [...state.notifications, notification],
    }),

    [getType(appActions.dismissNotification)]: (
      state: AppState,
      { payload: notificationId }: ReduxAction<string>,
    ): AppState => ({
      ...state,
      notifications: state.notifications.filter(
        ({ id }) => id !== notificationId,
      ),
    }),

    [getType(appActions.dismissAllNotifications)]: (
      state: AppState,
    ): AppState => ({
      ...state,
      notifications: [],
    }),

    [getType(appActions.updateTransferType)]: (
      state: AppState,
      { payload: currentTransferType }: ReduxAction<TransferType>,
    ): AppState => ({
      ...state,
      currentTransferType,
    }),

    [getType(appActions.updateTransferDetails)]: (
      state: AppState,
      { payload: transferDetails }: ReduxAction<TransferDetailsModel>,
    ): AppState => ({
      ...state,
      transferDetails,
    }),
  },
  initialState,
);
