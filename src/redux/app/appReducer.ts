import { getType } from 'typesafe-actions';
import { handleActions } from 'redux-actions';
import * as appActions from './appActions';
import { NotificationModel, TransferType } from '~/types/appTypes';
import { EntityModel, ReduxAction } from '~/types/commonTypes';

export interface AppState {
  readonly notifications: Array<NotificationModel>;
  readonly currentTransferType: TransferType;
  readonly inTransferEntity: Partial<EntityModel> | null;
}

export const initialState: AppState = {
  notifications: [],
  currentTransferType: TransferType.SingleUser,
  inTransferEntity: null,
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
      { payload: transferType }: ReduxAction<TransferType>,
    ): AppState => ({
      ...state,
      currentTransferType: transferType,
    }),

    [getType(appActions.updateInTransferEntity)]: (
      state: AppState,
      { payload: inTransferEntity }: ReduxAction<Partial<EntityModel>>,
    ): AppState => ({
      ...state,
      inTransferEntity,
    }),
  },
  initialState,
);
