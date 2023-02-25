import { createSelector } from "~/redux/reduxTools";
import type { Notification, ReduxState } from "~/typeDefs";

export const notificationsSelector = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): Notification[] => notifications,
);
