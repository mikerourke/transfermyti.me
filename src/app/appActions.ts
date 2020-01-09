import cuid from "cuid";
import { createAction } from "typesafe-actions";
import { capitalize, getIfDev } from "~/utils";
import {
  NotificationModel,
  ToolAction,
  ToolName,
  ToolNameByMappingModel,
} from "~/typeDefs";

export const showNotification = createAction(
  "@app/SHOW_NOTIFICATION",
  (notification: Partial<NotificationModel>) => {
    return { id: cuid(), ...notification } as NotificationModel;
  },
)<NotificationModel>();

// REFACTOR: Change this to `showErrorNotification` and extrapolate error type from the Error object.
export const showFetchErrorNotification = createAction(
  "@app/SHOW_FETCH_ERROR_NOTIFICATION",
  (err: Error & { toolName: ToolName }) => {
    if (getIfDev()) {
      console.error(err);
    }

    const name = capitalize(err.toolName);
    const message = `An error occurred when making a request to the ${name} API`;

    return {
      id: cuid(),
      message,
      type: "error",
    };
  },
)<NotificationModel>();

export const dismissNotification = createAction("@app/DISMISS_NOTIFICATION")<
  string
>();

export const dismissAllNotifications = createAction(
  "@app/DISMISS_ALL_NOTIFICATIONS",
)<undefined>();

export const updateToolNameByMapping = createAction(
  "@app/UPDATE_TOOL_NAME_BY_MAPPING",
)<ToolNameByMappingModel>();

export const updateToolAction = createAction("@app/UPDATE_TOOL_ACTION")<
  ToolAction
>();
