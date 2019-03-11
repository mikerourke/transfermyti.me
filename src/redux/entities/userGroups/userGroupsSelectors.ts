import { createSelector } from 'reselect';
import { get } from 'lodash';
import { getEntityRecordsByWorkspaceId } from '~/redux/utils';
import {
  selectTogglUserInclusionsByWorkspaceId,
  selectTogglUsersByWorkspaceId,
} from '~/redux/entities/users/usersSelectors';
import {
  CreateNamedEntityRequest,
  EntityType,
  ReduxState,
} from '~/types/commonTypes';
import { TimeEntryWithClientModel } from '~/types/timeEntriesTypes';
import { UserGroupModel } from '~/types/userGroupsTypes';
import { UserModel } from '~/types/usersTypes';

export const selectTogglUserGroupsById = createSelector(
  (state: ReduxState) => state.entities.userGroups.toggl.byId,
  userGroupsById => userGroupsById,
);

export const selectTogglUserGroupRecords = createSelector(
  selectTogglUserGroupsById,
  (userGroupsById): UserGroupModel[] =>
    Object.values(userGroupsById).filter(({ name }) => !/Admin/gi.test(name)),
);

const getTogglUserGroupsByWorkspaceIdWithEntryCounts = (
  inclusionsOnly: boolean,
  userGroupRecords: UserGroupModel[],
  usersByWorkspaceId: Record<string, UserModel[]>,
  timeEntriesById: Record<string, TimeEntryWithClientModel>,
) => {
  const userGroupsByWorkspaceId = getEntityRecordsByWorkspaceId(
    EntityType.UserGroup,
    userGroupRecords,
    timeEntriesById,
    inclusionsOnly,
  ) as Record<string, UserGroupModel[]>;

  return Object.entries(userGroupsByWorkspaceId).reduce(
    (acc, [workspaceId, userGroupRecords]) => {
      const workspaceUsers = get(usersByWorkspaceId, workspaceId, []);

      const updatedUserGroupRecords = userGroupRecords.map(userGroupRecord => {
        if (!userGroupRecord.userIds.length) return userGroupRecord;
        const groupEntryCount = userGroupRecord.userIds.reduce(
          (groupAcc, userId) => {
            const matchingUser = workspaceUsers.find(({ id }) => id === userId);
            if (!matchingUser) return groupAcc;
            return groupAcc + matchingUser.entryCount;
          },
          0,
        );

        return { ...userGroupRecord, entryCount: groupEntryCount };
      });

      return {
        ...acc,
        [workspaceId]: updatedUserGroupRecords,
      };
    },
    {},
  );
};

export const selectTogglUserGroupsByWorkspaceId = createSelector(
  [
    selectTogglUserGroupRecords,
    selectTogglUsersByWorkspaceId,
    (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  ],
  (...args): Record<string, UserGroupModel[]> =>
    getTogglUserGroupsByWorkspaceIdWithEntryCounts(false, ...args),
);

export const selectTogglUserGroupInclusionsByWorkspaceId = createSelector(
  [
    selectTogglUserGroupRecords,
    selectTogglUserInclusionsByWorkspaceId,
    (state: ReduxState) => state.entities.timeEntries.toggl.byId,
  ],
  (...args): Record<string, UserGroupModel[]> =>
    getTogglUserGroupsByWorkspaceIdWithEntryCounts(true, ...args),
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
