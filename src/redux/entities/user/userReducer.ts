import { handleActions, combineActions } from 'redux-actions';
import {
  fetchClockifyUserDetailsStarted,
  fetchClockifyUserDetailsSuccess,
  fetchClockifyUserDetailsFailure,
  fetchTogglUserDetailsStarted,
  fetchTogglUserDetailsSuccess,
  fetchTogglUserDetailsFailure,
} from './userActions';
import { UserModel } from '../../../types/user';

export interface UserState {
  readonly clockify: UserModel;
  readonly toggl: UserModel;
  readonly isFetching: boolean;
}

export const initialState: UserState = {
  clockify: {
    userId: null,
    email: null,
  },
  toggl: {
    userId: null,
    email: null,
  },
  isFetching: false,
};

export default handleActions(
  {
    [fetchClockifyUserDetailsSuccess]: (
      state: UserState,
      { payload: { id, email } }: any,
    ): UserState => ({
      ...state,
      clockify: {
        ...state.clockify,
        userId: id,
        email,
      },
    }),

    [fetchTogglUserDetailsSuccess]: (
      state: UserState,
      { payload: { id, email } }: any,
    ): UserState => ({
      ...state,
      toggl: {
        ...state.toggl,
        userId: id.toString(),
        email,
      },
    }),

    [combineActions(
      fetchClockifyUserDetailsStarted,
      fetchTogglUserDetailsStarted,
    )]: (state: UserState): UserState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      fetchClockifyUserDetailsSuccess,
      fetchClockifyUserDetailsFailure,
      fetchTogglUserDetailsSuccess,
      fetchTogglUserDetailsFailure,
    )]: (state: UserState): UserState => ({
      ...state,
      isFetching: false,
    }),
  },
  initialState,
);
