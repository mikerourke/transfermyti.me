import { createSelector } from 'reselect';
import ReduxEntity from '../../../utils/ReduxEntity';
import { UserGroupModel } from '../../../types/userGroupsTypes';
import { State } from '../../rootReducer';
import { EntityType } from '../../../types/commonTypes';

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
    ReduxEntity.getRecordsByWorkspaceId(
      EntityType.UserGroup,
      userGroupRecords,
      timeEntriesById,
    ),
);
