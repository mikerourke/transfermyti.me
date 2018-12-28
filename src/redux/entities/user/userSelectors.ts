import { createSelector } from 'reselect';
import { State } from '../../rootReducer';

export const selectClockifyUserId = createSelector(
  (state: State) => state.entities.user.clockify,
  ({ userId }): string => userId,
);

export const selectTogglUserEmail = createSelector(
  (state: State) => state.entities.user.toggl,
  ({ email }): string => email,
);
