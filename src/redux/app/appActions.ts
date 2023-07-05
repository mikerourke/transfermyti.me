import { createAction } from "~/redux/reduxTools";
import type { Notification } from "~/types";

export const allNotificationsDismissed = createAction<undefined>(
  "@app/allNotificationsDismissed",
);

export const errorNotificationShown = createAction<Error | Response>(
  "@app/errorNotificationShown",
);

export const notificationDismissed = createAction<string>(
  "@app/notificationDismissed",
);

export const notificationShown = createAction<Omit<Notification, "id">>(
  "@app/notificationShown",
);
