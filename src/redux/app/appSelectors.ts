import { createSelector } from 'reselect';
import { NotificationModel, ReduxState } from '~/types';

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

export const selectCountTransferred = createSelector(
  (state: ReduxState) => state.app.countTransferred,
  countTransferred => countTransferred,
);
