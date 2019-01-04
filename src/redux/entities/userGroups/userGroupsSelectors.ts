import { createSelector } from 'reselect';
import { getEntityRecordsByWorkspaceId } from '../../utils';
import { UserGroupModel } from '../../../types/userGroupsTypes';
import { EntityType } from '../../../types/commonTypes';
import { State } from '../../rootReducer';

export const selectClockifyUserGroupRecords = createSelector(
  (state: State) => state.entities.userGroups.clockify.userGroupsById,
  (userGroupsById): UserGroupModel[] => Object.values(userGroupsById),
);

export const selectTogglUserGroupsById = createSelector(
  (state: State) => state.entities.userGroups.toggl.userGroupsById,
  userGroupsById => userGroupsById,
);

export const selectTogglUserGroupRecords = createSelector(
  selectTogglUserGroupsById,
  (userGroupsById): UserGroupModel[] => Object.values(userGroupsById),
);

export const selectTogglUserGroupRecordsByWorkspaceId = createSelector(
  [
    selectTogglUserGroupRecords,
    (state: State) => state.entities.timeEntries.toggl.timeEntriesById,
  ],
  (userGroupRecords, timeEntriesById): Record<string, UserGroupModel[]> =>
    getEntityRecordsByWorkspaceId(
      EntityType.UserGroup,
      userGroupRecords,
      timeEntriesById,
    ),
);
