import { createSelector } from 'reselect';
import { NotificationModel } from '~/types/appTypes';
import { ReduxState } from '~/types/commonTypes';

export const selectNotifications = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): NotificationModel[] => notifications,
);
