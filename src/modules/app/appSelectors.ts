import { createSelector } from "reselect";

import type { NotificationModel, ReduxState } from "~/typeDefs";

export const notificationsSelector = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): NotificationModel[] => notifications,
);
