import { createSelector } from "reselect";
import { NotificationModel, ReduxState, RoutePath } from "~/typeDefs";

export const currentPathSelector = (state: ReduxState): RoutePath =>
  state.router.location.pathname as RoutePath;

export const notificationsSelector = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): NotificationModel[] => notifications,
);
