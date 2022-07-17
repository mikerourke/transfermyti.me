import { createAction } from "typesafe-actions";

import type { Notification } from "~/typeDefs";

export const notificationDismissed = createAction(
  "@app/notificationDismissed",
)<string>();

export const allNotificationsDismissed = createAction(
  "@app/allNotificationsDismissed",
)<undefined>();

export const notificationShown = createAction("@app/notificationShown")<
  Omit<Notification, "id">
>();

export const errorNotificationShown = createAction(
  "@app/errorNotificationShown",
)<Error | Response>();
