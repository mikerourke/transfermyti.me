import { combineActions, handleActions } from 'redux-actions';
import get from 'lodash/get';
import { getEntityNormalizedState, updateIsEntityIncluded } from '../../utils';
import {
  clockifyUsersFetchFailure,
  clockifyUsersFetchStarted,
  clockifyUsersFetchSuccess,
  togglUsersFetchFailure,
  togglUsersFetchStarted,
  togglUsersFetchSuccess,
  updateIsUserIncluded,
} from './usersActions';
import { EntityType, ToolName } from '../../../types/commonTypes';
import { ClockifyUser, TogglUser, UserModel } from '../../../types/usersTypes';
import { ReduxAction } from '../../rootReducer';

interface UsersEntryForTool {
  readonly usersById: Record<string, UserModel>;
  readonly userIds: string[];
}

export interface UsersState {
  readonly clockify: UsersEntryForTool;
  readonly toggl: UsersEntryForTool;
  readonly isFetching: boolean;
}

export const initialState: UsersState = {
  clockify: {
    usersById: {},
    userIds: [],
  },
  toggl: {
    usersById: {},
    userIds: [],
  },
  isFetching: false,
};

const schemaProcessStrategy = (value: ClockifyUser | TogglUser): UserModel => ({
  id: value.id.toString(),
  name: 'fullname' in value ? value.fullname : value.name,
  email: value.email,
  isAdmin: get(value, 'admin', null),
  isActive: 'status' in value ? value.status === 'ACTIVE' : true,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [clockifyUsersFetchSuccess]: (
      state: UsersState,
      { payload: users }: ReduxAction<ClockifyUser[]>,
    ): UsersState =>
      getEntityNormalizedState<UsersState, ClockifyUser[]>(
        ToolName.Clockify,
        EntityType.User,
        schemaProcessStrategy,
        state,
        users,
      ),

    [togglUsersFetchSuccess]: (
      state: UsersState,
      { payload: users }: ReduxAction<TogglUser[]>,
    ): UsersState =>
      getEntityNormalizedState<UsersState, TogglUser[]>(
        ToolName.Toggl,
        EntityType.User,
        schemaProcessStrategy,
        state,
        users,
      ),

    [combineActions(clockifyUsersFetchStarted, togglUsersFetchStarted)]: (
      state: UsersState,
    ): UsersState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyUsersFetchSuccess,
      clockifyUsersFetchFailure,
      togglUsersFetchSuccess,
      togglUsersFetchFailure,
    )]: (state: UsersState): UsersState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsUserIncluded]: (
      state: UsersState,
      { payload: userId }: ReduxAction<string>,
    ): UsersState =>
      updateIsEntityIncluded<UsersState>(state, EntityType.User, userId),
  },
  initialState,
);
