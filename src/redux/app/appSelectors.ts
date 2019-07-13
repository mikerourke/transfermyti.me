import { createSelector } from "reselect";
import {
  AggregateTransferCountsModel,
  NotificationModel,
  ReduxState,
} from "~/types";

export const selectNotifications = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): Array<NotificationModel> => notifications,
);

export const selectCurrentTransferType = (state: ReduxState) =>
  state.app.currentTransferType;

export const selectInTransferDetails = createSelector(
  (state: ReduxState) => state.app.inTransferDetails,
  inTransferDetails => inTransferDetails,
);

export const selectCountCurrentInWorkspace = (state: ReduxState) =>
  state.app.countCurrentInWorkspace;

export const selectCountTotalInWorkspace = (state: ReduxState) =>
  state.app.countTotalInWorkspace;

export const selectCountCurrentOverall = (state: ReduxState) =>
  state.app.countCurrentOverall;

export const selectCountTotalOverall = (state: ReduxState) =>
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
