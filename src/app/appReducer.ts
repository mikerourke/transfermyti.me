import { ActionType, createReducer } from "typesafe-actions";
import * as appActions from "./appActions";
import {
  InTransferDetailsModel,
  NotificationModel,
  TransferType,
} from "./appTypes";

type AppAction = ActionType<typeof appActions>;

export interface AppState {
  readonly notifications: NotificationModel[];
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

export const appReducer = createReducer<AppState, AppAction>(initialState)
  .handleAction(appActions.notificationShown, (state, { payload }) => ({
    ...state,
    notifications: [...state.notifications, payload],
  }))
  .handleAction(appActions.dismissNotification, (state, { payload }) => ({
    ...state,
    notifications: state.notifications.filter(({ id }) => id !== payload),
  }))
  .handleAction(appActions.dismissAllNotifications, state => ({
    ...state,
    notifications: [],
  }))
  .handleAction(appActions.updateCurrentTransferType, (state, { payload }) => ({
    ...state,
    currentTransferType: {
      ...state.currentTransferType,
      ...payload,
    },
  }))
  .handleAction(appActions.updateInTransferDetails, (state, { payload }) => ({
    ...state,
    inTransferDetails: payload,
    countCurrentInWorkspace: state.countCurrentInWorkspace + 1,
    countCurrentOverall: state.countCurrentOverall + 1,
  }))
  .handleAction(
    appActions.updateCountCurrentInWorkspace,
    (state, { payload }) => ({
      ...state,
      countCurrentInWorkspace: payload,
    }),
  )
  .handleAction(
    appActions.updateCountTotalInWorkspace,
    (state, { payload }) => ({
      ...state,
      countTotalInWorkspace: payload,
    }),
  )
  .handleAction(appActions.updateCountCurrentOverall, (state, { payload }) => ({
    ...state,
    countCurrentOverall: payload,
  }))
  .handleAction(appActions.updateCountTotalOverall, (state, { payload }) => ({
    ...state,
    countTotalOverall: payload,
  }));
