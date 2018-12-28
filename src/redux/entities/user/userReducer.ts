import { handleActions, combineActions } from 'redux-actions';
import {
  clockifyUserDetailsFetchStarted,
  clockifyUserDetailsFetchSuccess,
  clockifyUserDetailsFetchFailure,
  togglUserDetailsFetchStarted,
  togglUserDetailsFetchSuccess,
  togglUserDetailsFetchFailure,
} from './userActions';
import { UserModel } from '../../../types/userTypes';

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
    [clockifyUserDetailsFetchSuccess]: (
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

    [togglUserDetailsFetchSuccess]: (
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
      clockifyUserDetailsFetchStarted,
      togglUserDetailsFetchStarted,
    )]: (state: UserState): UserState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyUserDetailsFetchSuccess,
      clockifyUserDetailsFetchFailure,
      togglUserDetailsFetchSuccess,
      togglUserDetailsFetchFailure,
    )]: (state: UserState): UserState => ({
      ...state,
      isFetching: false,
    }),
  },
  initialState,
);
