import { combineActions, handleActions } from 'redux-actions';
import get from 'lodash/get';
import ReduxEntity from '../../../utils/ReduxEntity';
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
  isIncluded: true,
});

const reduxEntity = new ReduxEntity(EntityType.User, schemaProcessStrategy);

export default handleActions(
  {
    [clockifyUsersFetchSuccess]: (
      state: UsersState,
      { payload }: ReduxAction<ClockifyUser[]>,
    ): UsersState =>
      reduxEntity.getNormalizedState<UsersState, ClockifyUser[]>(
        ToolName.Clockify,
        state,
        payload,
      ),

    [togglUsersFetchSuccess]: (
      state: UsersState,
      { payload }: ReduxAction<TogglUser[]>,
    ): UsersState =>
      reduxEntity.getNormalizedState<UsersState, TogglUser[]>(
        ToolName.Toggl,
        state,
        payload,
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
    ): UsersState => reduxEntity.updateIsIncluded<UsersState>(state, userId),
  },
  initialState,
);
