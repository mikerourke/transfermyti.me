import { createAction } from "typesafe-actions";
import cuid from "cuid";
import { capitalize, getIfDev } from "~/utils";
import { ToolName, TransferMappingModel } from "~/common/commonTypes";
import { NotificationModel } from "./appTypes";

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

export const updateTransferMapping = createAction(
  "@app/UPDATE_TRANSFER_MAPPING",
)<TransferMappingModel>();

export const incrementCurrentTransferCount = createAction(
  "@app/INCREMENT_CURRENT_TRANSFER_COUNT",
)<void>();

export const resetCurrentTransferCount = createAction(
  "@app/RESET_CURRENT_TRANSFER_COUNT",
)<void>();

export const updateTotalTransferCount = createAction(
  "@app/UPDATE_TOTAL_TRANSFER_COUNT",
)<number>();
