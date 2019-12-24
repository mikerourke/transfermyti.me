import { createAction } from "typesafe-actions";
import cuid from "cuid";
import { capitalize, getIfDev } from "~/utils";
import {
  EntityGroup,
  ToolName,
  TransferMappingModel,
} from "~/common/commonTypes";
import { NotificationModel, NotificationType } from "./appTypes";

export const showNotification = createAction(
  "@app/SHOW_NOTIFICATION",
  (notification: Partial<NotificationModel>) => {
    return { id: cuid(), ...notification } as NotificationModel;
  },
)<NotificationModel>();

export const showFetchErrorNotification = createAction(
  "@app/SHOW_FETCH_ERROR_NOTIFICATION",
  (error: Error & { toolName: ToolName }) => {
    if (getIfDev()) {
      console.error(error);
    }

    const name = capitalize(error.toolName);
    const message = `An error occurred when making a request to the ${name} API`;

    return {
      id: cuid(),
      message,
      type: NotificationType.Error,
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

export const updateCurrentEntityGroup = createAction(
  "@app/UPDATE_CURRENT_ENTITY_GROUP",
)<EntityGroup | null>();

export const updateCurrentWorkspaceId = createAction(
  "@app/UPDATE_CURRENT_WORKSPACE_ID",
)<string | null>();

export const incrementCountCurrentInGroup = createAction(
  "@app/INCREMENT_COUNT_CURRENT_IN_GROUP",
)<void>();

export const resetCountCurrentInGroup = createAction(
  "@app/RESET_COUNT_CURRENT_IN_GROUP",
)<void>();

export const updateCountTotalInGroup = createAction(
  "@app/UPDATE_COUNT_TOTAL_IN_GROUP",
)<number>();

export const incrementCountCurrentInWorkspace = createAction(
  "@app/INCREMENT_COUNT_CURRENT_IN_WORKSPACE",
)<void>();

export const resetCountCurrentInWorkspace = createAction(
  "@app/RESET_COUNT_CURRENT_IN_WORKSPACE",
)<void>();

export const updateCountTotalInWorkspace = createAction(
  "@app/UPDATE_COUNT_TOTAL_IN_WORKSPACE",
)<number>();

export const incrementCountCurrentOverall = createAction(
  "@app/INCREMENT_COUNT_CURRENT_OVERALL",
)<void>();

export const resetCountCurrentOverall = createAction(
  "@app/RESET_COUNT_CURRENT_OVERALL",
)<void>();

export const updateCountTotalOverall = createAction(
  "@app/UPDATE_COUNT_TOTAL_OVERALL",
)<number>();
