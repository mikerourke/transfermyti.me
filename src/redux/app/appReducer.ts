import { get } from 'lodash';
import { getType } from 'typesafe-actions';
import { handleActions } from 'redux-actions';
import * as appActions from './appActions';
import {
  CompoundWorkspaceModel,
  InTransferDetailsByGroupModel,
  InTransferDetailsModel,
  NotificationModel,
  ReduxAction,
  TransferType,
} from '~/types';

export interface AppState {
  readonly notifications: Array<NotificationModel>;
  readonly currentTransferType: TransferType;
  readonly inTransferWorkspace: CompoundWorkspaceModel | null;
  readonly inTransferDetailsByGroupByWorkspace: Record<
    string,
    InTransferDetailsByGroupModel | null
  >;
}

export const initialState: AppState = {
  notifications: [],
  currentTransferType: TransferType.SingleUser,
  inTransferWorkspace: null,
  inTransferDetailsByGroupByWorkspace: {},
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

    [getType(appActions.updateInTransferWorkspace)]: (
      state: AppState,
      { payload: inTransferWorkspace }: ReduxAction<CompoundWorkspaceModel>,
    ): AppState => ({
      ...state,
      inTransferWorkspace,
    }),

    [getType(appActions.updateInTransferDetails)]: (
      state: AppState,
      { payload: inTransferDetails }: ReduxAction<InTransferDetailsModel>,
    ): AppState => {
      const { entityGroup, workspaceId } = inTransferDetails;
      const existingForWorkspace = get(
        state,
        ['inTransferDetailsByGroupByWorkspace', workspaceId],
        {},
      );

      return {
        ...state,
        inTransferDetailsByGroupByWorkspace: {
          ...state.inTransferDetailsByGroupByWorkspace,
          [workspaceId]: {
            ...existingForWorkspace,
            [entityGroup]: inTransferDetails,
          },
        },
      };
    },
  },
  initialState,
);
