import cuid from "cuid";
import { type ActionType, createReducer } from "typesafe-actions";

import * as appActions from "~/modules/app/appActions";
import type { Notification } from "~/typeDefs";
import { isDevelopmentMode } from "~/utilities/environment";

type AppAction = ActionType<typeof appActions>;

export interface AppState {
  readonly notifications: Notification[];
}

export const initialState: AppState = {
  notifications: [],
};

export const appReducer = createReducer<AppState, AppAction>(initialState)
  .handleAction(appActions.notificationShown, (state, { payload }) => ({
    ...state,
    notifications: [...state.notifications, { ...payload, id: cuid() }],
  }))
  .handleAction(appActions.errorNotificationShown, (state, { payload }) => ({
    ...state,
    notifications: [
      ...state.notifications,
      {
        id: cuid(),
        message: messageFromErrorOrResponse(payload),
        type: "error",
      },
    ],
  }))
  .handleAction(appActions.notificationDismissed, (state, { payload }) => ({
    ...state,
    notifications: state.notifications.filter(({ id }) => id !== payload),
  }))
  .handleAction(appActions.allNotificationsDismissed, (state) => ({
    ...state,
    notifications: [],
  }));

function messageFromErrorOrResponse(err: Error | Response): string {
  /* istanbul ignore if  */
  if (isDevelopmentMode()) {
    console.error(err);
  }

  let message;
  if ("ok" in err) {
    message = extrapolateApiErrorMessage(err);
  } else {
    message = err.message;
  }

  // This is a redux-saga error that should only occur during development, but
  // we're cleaning it up here (just in case):
  if (/call: argument fn is undefined or null/gi.test(message)) {
    message = "Parsing error";
  }

  return `The following error occurred: ${message}`;
}

function extrapolateApiErrorMessage(response: Response): string {
  const { status, statusText, url } = response;

  let toolName;
  if (/clockify/gi.test(url)) {
    toolName = "Clockify";
  } else if (/toggl/gi.test(url)) {
    toolName = "Toggl";
  } else {
    toolName = "unknown";
  }

  let message = `Error code ${status} when fetching from ${toolName} API.`;
  if (statusText) {
    message += ` Status: ${statusText}`;
  }

  return message;
}
