import { createSelector } from 'reselect';
import { UserGroupModel } from '../../../types/userGroupsTypes';
import { State } from '../../rootReducer';

export const selectTogglUserGroupRecords = createSelector(
  (state: State) => state.entities.userGroups.toggl.userGroupsById,
  (userGroupsById): UserGroupModel[] => Object.values(userGroupsById),
);
