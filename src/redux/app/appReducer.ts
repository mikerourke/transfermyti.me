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
  readonly countCurrentInWorkspace: number;
  readonly countTotalInWorkspace: number;
  readonly countCurrentOverall: number;
  readonly countTotalOverall: number;
}

export const initialState: AppState = {
  notifications: [],
  currentTransferType: TransferType.SingleUser,
  inTransferDetails: {
    countCurrentInGroup: 0,
    countTotalInGroup: 0,
    entityGroup: null,
    workspaceId: null,
  },
  countCurrentInWorkspace: 0,
  countTotalInWorkspace: 0,
  countCurrentOverall: 0,
  countTotalOverall: 0,
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
        countCurrentInWorkspace: state.countCurrentInWorkspace + 1,
        countCurrentOverall: state.countCurrentOverall + 1,
      };
    },

    [getType(appActions.updateCountCurrentInWorkspace)]: (
      state: AppState,
      { payload: countCurrentInWorkspace }: ReduxAction<number>,
    ): AppState => ({
      ...state,
      countCurrentInWorkspace,
    }),

    [getType(appActions.updateCountTotalInWorkspace)]: (
      state: AppState,
      { payload: countTotalInWorkspace }: ReduxAction<number>,
    ): AppState => ({
      ...state,
      countTotalInWorkspace,
    }),

    [getType(appActions.updateCountCurrentOverall)]: (
      state: AppState,
      { payload: countCurrentOverall }: ReduxAction<number>,
    ): AppState => ({
      ...state,
      countCurrentOverall,
    }),

    [getType(appActions.updateCountTotalOverall)]: (
      state: AppState,
      { payload: countTotalOverall }: ReduxAction<number>,
    ): AppState => ({
      ...state,
      countTotalOverall,
    }),
  },
  initialState,
);
