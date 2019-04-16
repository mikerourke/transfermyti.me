import { createSelector } from 'reselect';
import { NotificationModel, ReduxState } from '~/types';

export const selectNotifications = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): Array<NotificationModel> => notifications,
);

export const selectCurrentTransferType = (state: ReduxState) =>
  state.app.currentTransferType;

export const selectInTransferEntity = (state: ReduxState) =>
  state.app.inTransferEntity;
