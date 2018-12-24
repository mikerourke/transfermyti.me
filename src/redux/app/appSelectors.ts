import { createSelector } from 'reselect';
import { State } from '../rootReducer';

export const selectNotifications = createSelector(
  (state: State) => state.app.notifications,
  notifications => notifications,
);
