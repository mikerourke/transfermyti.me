import { createAction } from "typesafe-actions";
import cuid from "cuid";
import { capitalize, getIfDev } from "~/utils";
import { ToolName } from "~/allEntities/allEntitiesTypes";
import { NotificationModel, ToolNameByMappingModel } from "./appTypes";

export const showNotification = createAction(
  "@app/SHOW_NOTIFICATION",
  (notification: Partial<NotificationModel>) => {
    return { id: cuid(), ...notification } as NotificationModel;
  },
)<NotificationModel>();

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
