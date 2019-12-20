import { createSelector } from "reselect";
import {
  AggregateTransferCountsModel,
  NotificationModel,
  ReduxState,
  TransferType,
} from "~/types";

export const selectNotifications = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): Array<NotificationModel> => notifications,
);

export const selectCurrentTransferType = (state: ReduxState): TransferType =>
  state.app.currentTransferType;

export const selectInTransferDetails = createSelector(
  (state: ReduxState) => state.app.inTransferDetails,
  inTransferDetails => inTransferDetails,
);

export const selectCountCurrentInWorkspace = (state: ReduxState): number =>
  state.app.countCurrentInWorkspace;

export const selectCountTotalInWorkspace = (state: ReduxState): number =>
  state.app.countTotalInWorkspace;

export const selectCountCurrentOverall = (state: ReduxState): number =>
  state.app.countCurrentOverall;

export const selectCountTotalOverall = (state: ReduxState): number =>
  state.app.countTotalOverall;

export const selectAggregateTransferCounts = createSelector(
  selectCountCurrentInWorkspace,
  selectCountTotalInWorkspace,
  selectCountCurrentOverall,
  selectCountTotalOverall,
  (
    countCurrentInWorkspace,
    countTotalInWorkspace,
    countCurrentOverall,
    countTotalOverall,
  ): AggregateTransferCountsModel => ({
    countCurrentInWorkspace,
    countTotalInWorkspace,
    countCurrentOverall,
    countTotalOverall,
  }),
);
