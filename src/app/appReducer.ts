import { ActionType, createReducer } from "typesafe-actions";
import * as appActions from "./appActions";
import { ToolName, TransferMappingModel } from "~/common/commonTypes";
import { NotificationModel } from "./appTypes";

type AppAction = ActionType<typeof appActions>;

export interface AppState {
  readonly notifications: NotificationModel[];
  readonly transferMapping: TransferMappingModel;
  readonly currentTransferCount: number;
  readonly totalTransferCount: number;
}

export const initialState: AppState = {
  notifications: [],
  transferMapping: {
    source: ToolName.None,
    target: ToolName.None,
  },
  currentTransferCount: 0,
  totalTransferCount: 0,
};

export const appReducer = createReducer<AppState, AppAction>(initialState)
  .handleAction(
    [appActions.showNotification, appActions.showFetchErrorNotification],
    (state, { payload }) => ({
      ...state,
      notifications: [...state.notifications, payload],
    }),
  )
  .handleAction(appActions.dismissNotification, (state, { payload }) => ({
    ...state,
    notifications: state.notifications.filter(({ id }) => id !== payload),
  }))
  .handleAction(appActions.dismissAllNotifications, state => ({
    ...state,
    notifications: [],
  }))
  .handleAction(appActions.updateTransferMapping, (state, { payload }) => ({
    ...state,
    transferMapping: {
      ...state.transferMapping,
      ...payload,
    },
  }))
  .handleAction(appActions.incrementCurrentTransferCount, state => ({
    ...state,
    currentTransferCount: state.currentTransferCount + 1,
  }))
  .handleAction(appActions.resetCurrentTransferCount, state => ({
    ...state,
    currentTransferCount: 0,
  }))
  .handleAction(appActions.updateTotalTransferCount, (state, { payload }) => ({
    ...state,
    totalTransferCount: payload,
  }));
