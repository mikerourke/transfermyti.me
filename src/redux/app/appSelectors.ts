import type { Notification, ReduxState } from "~/types";

export const notificationsSelector = (state: ReduxState): Notification[] =>
  state.app.notifications;
