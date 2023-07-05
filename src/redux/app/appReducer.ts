import { createReducer, nanoid } from "~/redux/reduxTools";
import type { Notification } from "~/types";
import { isDevelopmentMode } from "~/utilities/environment";

import * as appActions from "./appActions";

export interface AppState {
  readonly notifications: Notification[];
}

export const appInitialState: AppState = {
  notifications: [],
};

export const appReducer = createReducer<AppState>(
  appInitialState,
  (builder) => {
    builder
      .addCase(appActions.allNotificationsDismissed, (state) => {
        state.notifications = [];
      })
      .addCase(appActions.errorNotificationShown, (state, { payload }) => ({
        ...state,
        notifications: [...state.notifications, getErrorNotification(payload)],
      }))
      .addCase(appActions.notificationShown, (state, { payload }) => ({
        ...state,
        notifications: [...state.notifications, { ...payload, id: nanoid() }],
      }))
      .addCase(appActions.notificationDismissed, (state, { payload }) => ({
        ...state,
        notifications: state.notifications.filter(({ id }) => id !== payload),
      }));
  },
);

function getErrorNotification(err: Error | Response): Notification {
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

  return {
    id: nanoid(),
    message: `The following error occurred: ${message}`,
    type: "error",
  };
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
