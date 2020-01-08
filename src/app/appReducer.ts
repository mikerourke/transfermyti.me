import { ActionType, createReducer } from "typesafe-actions";
import * as appActions from "./appActions";
import {
  ToolName,
  ToolNameByMappingModel,
} from "~/allEntities/allEntitiesTypes";
import { NotificationModel, ToolAction } from "./appTypes";

type AppAction = ActionType<typeof appActions>;

export interface AppState {
  readonly notifications: NotificationModel[];
  readonly toolNameByMapping: ToolNameByMappingModel;
  readonly toolAction: ToolAction;
}

export const initialState: AppState = {
  notifications: [],
  toolNameByMapping: {
    source: ToolName.None,
    target: ToolName.None,
  },
  toolAction: ToolAction.None,
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
  .handleAction(appActions.updateToolNameByMapping, (state, { payload }) => ({
    ...state,
    toolNameByMapping: {
      ...state.toolNameByMapping,
      ...payload,
    },
  }))
  .handleAction(appActions.updateToolAction, (state, { payload }) => ({
    ...state,
    toolAction: payload,
  }));
