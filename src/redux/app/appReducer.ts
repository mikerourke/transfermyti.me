import { getType } from 'typesafe-actions';
import { handleActions } from 'redux-actions';
import * as appActions from './appActions';
import {
  InTransferDetailsModel,
  NotificationModel,
  ReduxAction,
  TransferType,
} from '~/types';

export interface AppState {
  readonly notifications: Array<NotificationModel>;
  readonly currentTransferType: TransferType;
  readonly inTransferDetails: InTransferDetailsModel;
  readonly countTransferred: number;
}

export const initialState: AppState = {
  notifications: [],
  currentTransferType: TransferType.SingleUser,
  inTransferDetails: {
    countTotal: 0,
    countCurrent: 0,
    entityGroup: null,
    workspaceId: null,
  },
  countTransferred: 0,
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

    [getType(appActions.updateInTransferDetails)]: (
      state: AppState,
      { payload: inTransferDetails }: ReduxAction<InTransferDetailsModel>,
    ): AppState => {
      return {
        ...state,
        inTransferDetails,
        countTransferred: state.countTransferred + 1,
      };
    },

    [getType(appActions.updateTotalTransferredCount)]: (
      state: AppState,
      { payload: countTransferred }: ReduxAction<number>,
    ): AppState => ({
      ...state,
      countTransferred: countTransferred,
    }),
  },
  initialState,
);
