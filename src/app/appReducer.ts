import { ActionType, createReducer } from "typesafe-actions";
import * as appActions from "./appActions";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { NotificationModel, ToolNameByMappingModel } from "./appTypes";

type AppAction = ActionType<typeof appActions>;

export interface AppState {
  readonly notifications: NotificationModel[];
  readonly toolNameByMapping: ToolNameByMappingModel;
}

export const initialState: AppState = {
  notifications: [],
  toolNameByMapping: {
    source: ToolName.None,
    target: ToolName.None,
  },
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
  }));
