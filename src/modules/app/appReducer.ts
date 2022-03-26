import { ActionType, createReducer } from "typesafe-actions";

import * as appActions from "~/modules/app/appActions";
import type { NotificationModel } from "~/typeDefs";

type AppAction = ActionType<typeof appActions>;

export interface AppState {
  readonly notifications: NotificationModel[];
}

export const initialState: AppState = {
  notifications: [],
};

export const appReducer = createReducer<AppState, AppAction>(initialState)
  .handleAction(
    [appActions.showNotification, appActions.showErrorNotification],
    (state, { payload }) => ({
      ...state,
      notifications: [...state.notifications, payload],
    }),
  )
  .handleAction(appActions.dismissNotification, (state, { payload }) => ({
    ...state,
    notifications: state.notifications.filter(({ id }) => id !== payload),
  }))
  .handleAction(appActions.dismissAllNotifications, (state) => ({
    ...state,
    notifications: [],
  }));
