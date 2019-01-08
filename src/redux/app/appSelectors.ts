import { createSelector } from 'reselect';
import { NotificationModel } from '../../types/appTypes';
import { State } from '../rootReducer';

export const selectNotifications = createSelector(
  (state: State) => state.app.notifications,
  (notifications): NotificationModel[] => notifications,
);
