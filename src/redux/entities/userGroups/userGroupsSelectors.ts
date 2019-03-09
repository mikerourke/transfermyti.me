import { createSelector } from 'reselect';
import { get } from 'lodash';
import { getEntityRecordsByWorkspaceId } from '~/redux/utils';
import {
  CreateNamedEntityRequest,
  EntityType,
  ReduxState,
} from '~/types/commonTypes';
import { UserGroupModel } from '~/types/userGroupsTypes';

export const selectTogglUserGroupsById = createSelector(
  (state: ReduxState) => state.entities.userGroups.toggl.byId,
  userGroupsById => userGroupsById,
);

export const selectTogglUserGroupRecords = createSelector(
  selectTogglUserGroupsById,
  (userGroupsById): UserGroupModel[] =>
    Object.values(userGroupsById).filter(({ name }) => !/Admin/gi.test(name)),
);

export const selectTogglUserGroupsByWorkspaceId = createSelector(
  [
    selectTogglUserGroupRecords,
    (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  ],
  (userGroupRecords, timeEntriesById): Record<string, UserGroupModel[]> =>
    getEntityRecordsByWorkspaceId(
      EntityType.UserGroup,
      userGroupRecords,
      timeEntriesById,
      false,
    ),
);

export const selectTogglUserGroupInclusionsByWorkspaceId = createSelector(
  [
    selectTogglUserGroupRecords,
    (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  ],
  (userGroupRecords, timeEntriesById): Record<string, UserGroupModel[]> =>
    getEntityRecordsByWorkspaceId(
      EntityType.UserGroup,
      userGroupRecords,
      timeEntriesById,
      true,
    ),
);

export const selectUserGroupsTransferPayloadForWorkspace = createSelector(
  [
    selectTogglUserGroupInclusionsByWorkspaceId,
    (_: null, workspaceId: string) => workspaceId,
  ],
  (inclusionsByWorkspaceId, workspaceIdToGet): CreateNamedEntityRequest[] => {
    const includedRecords = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as UserGroupModel[];
    if (includedRecords.length === 0) return [];

    return includedRecords.reduce((acc, { workspaceId, name }) => {
      if (workspaceId !== workspaceIdToGet) return acc;
      return [...acc, { name }];
    }, []);
  },
);
