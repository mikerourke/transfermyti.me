import { getType } from 'typesafe-actions';
import { handleActions } from 'redux-actions';
import * as appActions from './appActions';
import {
  NotificationModel,
  TimeEntryTransferDetailsModel,
  TransferType,
} from '~/types/appTypes';
import { CompoundEntityModel, ReduxAction } from '~/types/commonTypes';

export interface AppState {
  readonly notifications: Array<NotificationModel>;
  readonly currentTransferType: TransferType;
  readonly inTransferEntity: Partial<CompoundEntityModel> | null;
  readonly timeEntryTransferDetails: TimeEntryTransferDetailsModel;
}

export const initialState: AppState = {
  notifications: [],
  currentTransferType: TransferType.SingleUser,
  inTransferEntity: null,
  timeEntryTransferDetails: {
    countCurrent: 0,
    countTotal: 0,
    projectName: '',
    workspaceName: '',
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

    [getType(appActions.updateInTransferEntity)]: (
      state: AppState,
      { payload: inTransferEntity }: ReduxAction<Partial<CompoundEntityModel>>,
    ): AppState => ({
      ...state,
      inTransferEntity,
    }),

    [getType(appActions.updateTimeEntryTransferDetails)]: (
      state: AppState,
      {
        payload: timeEntryTransferDetails,
      }: ReduxAction<TimeEntryTransferDetailsModel>,
    ): AppState => ({
      ...state,
      timeEntryTransferDetails,
    }),
  },
  initialState,
);
