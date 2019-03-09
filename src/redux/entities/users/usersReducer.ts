import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import { get } from 'lodash';
import {
  getEntityNormalizedState,
  updateIsEntityIncluded,
} from '~/redux/utils';
import * as usersActions from './usersActions';
import {
  EntityGroup,
  EntityType,
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import {
  ClockifyUser,
  ClockifyUserStatus,
  TogglUser,
  UserModel,
} from '~/types/usersTypes';

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
    [getType(usersActions.clockifyUsersFetch.success)]: (
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

    [getType(usersActions.togglUsersFetch.success)]: (
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
      getType(usersActions.clockifyUsersFetch.request),
      getType(usersActions.togglUsersFetch.request),
      getType(usersActions.clockifyUsersTransfer.request),
    )]: (state: UsersState): UsersState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(usersActions.clockifyUsersFetch.success),
      getType(usersActions.clockifyUsersFetch.failure),
      getType(usersActions.togglUsersFetch.success),
      getType(usersActions.togglUsersFetch.failure),
      getType(usersActions.clockifyUsersTransfer.success),
      getType(usersActions.clockifyUsersTransfer.failure),
    )]: (state: UsersState): UsersState => ({
      ...state,
      isFetching: false,
    }),

    [getType(usersActions.updateIsUserIncluded)]: (
      state: UsersState,
      { payload: userId }: ReduxAction<string>,
    ): UsersState => updateIsEntityIncluded(state, EntityType.User, userId),
  },
  initialState,
);
