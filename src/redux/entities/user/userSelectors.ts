import { createSelector } from 'reselect';
import { State } from '../../rootReducer';

export const selectClockifyUserDetails = createSelector(
  (state: State) => state.entities.user.clockify,
  userDetails => userDetails,
);

export const selectTogglUserDetails = createSelector(
  (state: State) => state.entities.user.toggl,
  userDetails => userDetails,
);

export const selectUserDetails = createSelector(
  (state: State) => state.entities.user,
  userDetails => userDetails,
);
