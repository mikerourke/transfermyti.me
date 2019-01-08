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
  clockifyUsersTransferFailure,
  clockifyUsersTransferStarted,
  clockifyUsersTransferSuccess,
  updateIsUserIncluded,
} from './usersActions';
import {
  EntityGroup,
  EntityType,
  ReduxStateEntryForTool,
  ToolName,
} from '../../../types/commonTypes';
import {
  ClockifyUser,
  ClockifyUserStatus,
  TogglUser,
  UserModel,
} from '../../../types/usersTypes';
import { ReduxAction } from '../../rootReducer';

export interface UsersState {
  readonly clockify: ReduxStateEntryForTool<UserModel>;
  readonly toggl: ReduxStateEntryForTool<UserModel>;
  readonly isFetching: boolean;
}

export const initialState: UsersState = {
  clockify: {
    byId: {},
    idValues: [],
  },
  toggl: {
    byId: {},
    idValues: [],
  },
  isFetching: false,
};

const schemaProcessStrategy = (value: ClockifyUser | TogglUser): UserModel => ({
  id: value.id.toString(),
  name: 'fullname' in value ? value.fullname : value.name,
  email: value.email,
  isAdmin: get(value, 'admin', null),
  isActive:
    'status' in value ? value.status === ClockifyUserStatus.Active : true,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [clockifyUsersFetchSuccess]: (
      state: UsersState,
      { payload: users }: ReduxAction<ClockifyUser[]>,
    ): UsersState =>
      getEntityNormalizedState(
        ToolName.Clockify,
        EntityGroup.Users,
        schemaProcessStrategy,
        state,
        users,
      ),

    [togglUsersFetchSuccess]: (
      state: UsersState,
      { payload: users }: ReduxAction<TogglUser[]>,
    ): UsersState =>
      getEntityNormalizedState(
        ToolName.Toggl,
        EntityGroup.Users,
        schemaProcessStrategy,
        state,
        users,
      ),

    [combineActions(
      clockifyUsersFetchStarted,
      togglUsersFetchStarted,
      clockifyUsersTransferStarted,
    )]: (state: UsersState): UsersState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyUsersFetchSuccess,
      clockifyUsersFetchFailure,
      togglUsersFetchSuccess,
      togglUsersFetchFailure,
      clockifyUsersTransferSuccess,
      clockifyUsersTransferFailure,
    )]: (state: UsersState): UsersState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsUserIncluded]: (
      state: UsersState,
      { payload: userId }: ReduxAction<string>,
    ): UsersState => updateIsEntityIncluded(state, EntityType.User, userId),
  },
  initialState,
);
