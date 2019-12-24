import { ActionType, createReducer } from "typesafe-actions";
import * as appActions from "./appActions";
import { NotificationModel } from "./appTypes";
import {
  EntityGroup,
  ToolName,
  TransferMappingModel,
} from "~/common/commonTypes";

type AppAction = ActionType<typeof appActions>;

export interface AppState {
  readonly notifications: NotificationModel[];
  readonly transferMapping: TransferMappingModel;
  readonly currentEntityGroup: EntityGroup | null;
  readonly currentWorkspaceId: string | null;
  readonly countCurrentInGroup: number;
  readonly countTotalInGroup: number;
  readonly countCurrentInWorkspace: number;
  readonly countTotalInWorkspace: number;
  readonly countCurrentOverall: number;
  readonly countTotalOverall: number;
}

export const initialState: AppState = {
  notifications: [],
  transferMapping: {
    source: ToolName.None,
    target: ToolName.None,
  },
  currentEntityGroup: null,
  currentWorkspaceId: null,
  countCurrentInGroup: 0,
  countTotalInGroup: 0,
  countCurrentInWorkspace: 0,
  countTotalInWorkspace: 0,
  countCurrentOverall: 0,
  countTotalOverall: 0,
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
  .handleAction(appActions.updateCurrentEntityGroup, (state, { payload }) => ({
    ...state,
    currentEntityGroup: payload,
  }))
  .handleAction(appActions.updateCurrentWorkspaceId, (state, { payload }) => ({
    ...state,
    currentWorkspaceId: payload,
  }))
  .handleAction(appActions.incrementCountCurrentInGroup, state => ({
    ...state,
    countCurrentInGroup: state.countCurrentInGroup + 1,
  }))
  .handleAction(appActions.resetCountCurrentInGroup, state => ({
    ...state,
    countCurrentInGroup: 0,
  }))
  .handleAction(appActions.updateCountTotalInGroup, (state, { payload }) => ({
    ...state,
    countTotalInGroup: payload,
  }))
  .handleAction(appActions.incrementCountCurrentInWorkspace, state => ({
    ...state,
    countCurrentInWorkspace: state.countCurrentInWorkspace + 1,
  }))
  .handleAction(appActions.resetCountCurrentInWorkspace, state => ({
    ...state,
    countCurrentInWorkspace: 0,
  }))
  .handleAction(
    appActions.updateCountTotalInWorkspace,
    (state, { payload }) => ({
      ...state,
      countTotalInWorkspace: payload,
    }),
  )
  .handleAction(appActions.incrementCountCurrentOverall, state => ({
    ...state,
    countCurrentOverall: state.countCurrentOverall + 1,
  }))
  .handleAction(appActions.resetCountCurrentOverall, state => ({
    ...state,
    countCurrentOverall: 0,
  }))
  .handleAction(appActions.updateCountTotalOverall, (state, { payload }) => ({
    ...state,
    countTotalOverall: payload,
  }));
