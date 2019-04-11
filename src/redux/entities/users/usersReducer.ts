import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import { get } from 'lodash';
import {
  normalizeState,
  flipEntityInclusion,
  appendEntryCountToState,
} from '~/redux/utils';
import { togglTimeEntriesFetch } from '~/redux/entities/timeEntries/timeEntriesActions';
import * as usersActions from './usersActions';
import {
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import { EntityGroup, EntityType } from '~/types/entityTypes';
import {
  ClockifyUser,
  ClockifyUserStatus,
  TogglUser,
  UserModel,
} from '~/types/usersTypes';
import { TogglTimeEntry } from '~/types/timeEntriesTypes';

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
  userGroupIds: 'userGroupIds' in value ? value.userGroupIds : [],
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export const usersReducer = handleActions(
  {
    [getType(usersActions.clockifyUsersFetch.success)]: (
      state: UsersState,
      { payload: users }: ReduxAction<Array<ClockifyUser>>,
    ): UsersState =>
      normalizeState(
        ToolName.Clockify,
        EntityGroup.Users,
        state,
        users,
        schemaProcessStrategy,
      ),

    [getType(usersActions.togglUsersFetch.success)]: (
      state: UsersState,
      { payload: users }: ReduxAction<Array<TogglUser>>,
    ): UsersState =>
      normalizeState(
        ToolName.Toggl,
        EntityGroup.Users,
        state,
        users,
        schemaProcessStrategy,
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

    [getType(usersActions.flipIsUserIncluded)]: (
      state: UsersState,
      { payload: userId }: ReduxAction<string>,
    ): UsersState => flipEntityInclusion(state, EntityType.User, userId),

    [getType(togglTimeEntriesFetch.success)]: (
      state: UsersState,
      { payload: timeEntries }: ReduxAction<Array<TogglTimeEntry>>,
    ) =>
      appendEntryCountToState(
        EntityType.User,
        ToolName.Toggl,
        state,
        timeEntries,
      ),
  },
  initialState,
);
