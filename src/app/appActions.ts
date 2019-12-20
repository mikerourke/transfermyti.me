import { createAction } from "typesafe-actions";
import { capitalize, isNil, uniqueId } from "lodash";
import { getIfDev } from "~/utils";
import { selectCountTotalOfTransfersOverall } from "~/workspaces/workspacesSelectors";
import { ToolName } from "~/common/commonTypes";
import { ReduxDispatch, ReduxGetState } from "~/redux/reduxTypes";
import {
  InTransferDetailsModel,
  NotificationModel,
  NotificationType,
  TransferCountsModel,
  TransferType,
} from "./appTypes";

export const notificationShown = createAction("@app/NOTIFICATION_SHOWN")<
  NotificationModel
>();

export const dismissNotification = createAction("@app/DISMISS_NOTIFICATION")<
  string
>();

export const dismissAllNotifications = createAction(
  "@app/DISMISS_ALL_NOTIFICATIONS",
)<undefined>();

export const updateTransferType = createAction("@app/UPDATE_TRANSFER_TYPE")<
  TransferType
>();

export const updateInTransferDetails = createAction(
  "@app/UPDATE_IN_TRANSFER_DETAILS",
)<InTransferDetailsModel>();

export const updateCountCurrentInWorkspace = createAction(
  "@app/UPDATE_COUNT_CURRENT_IN_AGGREGATE",
)<number>();

export const updateCountTotalInWorkspace = createAction(
  "@app/UPDATE_COUNT_TOTAL_IN_AGGREGATE",
)<number>();

export const updateCountCurrentOverall = createAction(
  "@app/UPDATE_COUNT_CURRENT_OVERALL",
)<number>();

export const updateCountTotalOverall = createAction(
  "@app/UPDATE_COUNT_TOTAL_OVERALL",
)<number>();

export const updateCountsInWorkspace = (
  workspaceTransferCounts: TransferCountsModel,
) => (dispatch: ReduxDispatch) => {
  const { countCurrent, countTotal } = workspaceTransferCounts;
  dispatch(updateCountCurrentInWorkspace(countCurrent));
  dispatch(updateCountTotalInWorkspace(countTotal));
};

export const updateCountsOverallBeforeTransfer = () => (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  const countTotalOverall = selectCountTotalOfTransfersOverall(getState());
  dispatch(updateCountCurrentOverall(0));
  dispatch(updateCountTotalOverall(countTotalOverall));
};

export const showNotification = (notification: Partial<NotificationModel>) => (
  dispatch: ReduxDispatch,
): string => {
  const id = isNil(notification.id) ? uniqueId("NTF") : notification.id;
  const validNotification = { ...notification, id } as NotificationModel;
  dispatch(notificationShown(validNotification));
  return id;
};

export const showFetchErrorNotification = (
  error: Error & { toolName: ToolName },
) => (dispatch: ReduxDispatch): void => {
  if (getIfDev()) {
    console.error(error);
  }

  const name = capitalize(error.toolName);
  const message = `An error occurred when making a request to the ${name} API`;

  const notification = { message, type: NotificationType.Error };
  dispatch(showNotification(notification));
};
