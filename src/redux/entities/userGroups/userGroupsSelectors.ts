import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { selectTogglUsersByWorkspaceFactory } from '~/redux/entities/users/usersSelectors';
import { CreateNamedEntityRequest, ReduxState } from '~/types/commonTypes';
import { UserGroupModel } from '~/types/userGroupsTypes';
import { UserModel } from '~/types/usersTypes';

export const selectTogglUserGroups = createSelector(
  (state: ReduxState) => state.entities.userGroups.toggl.byId,
  (userGroupsById): UserGroupModel[] =>
    Object.values(userGroupsById).filter(({ name }) => !/Admin/gi.test(name)),
);

const appendUserGroupEntryCount = (
  userGroups: UserGroupModel[],
  workspaceUsers: UserModel[],
) =>
  userGroups.map(userGroup => {
    if (!userGroup.userIds.length) return userGroup;
    const groupEntryCount = userGroup.userIds.reduce((groupAcc, userId) => {
      const matchingUser = workspaceUsers.find(({ id }) => id === userId);
      if (!matchingUser) return groupAcc;
      return groupAcc + matchingUser.entryCount;
    }, 0);

    return { ...userGroup, entryCount: groupEntryCount };
  });

export const selectTogglUserGroupsByWorkspaceFactory = (
  inclusionsOnly: boolean,
) =>
  createSelector(
    selectTogglUserGroups,
    selectTogglUsersByWorkspaceFactory(inclusionsOnly),
    (userGroups, usersByWorkspaceId): Record<string, UserGroupModel[]> => {
      const userGroupsToUse = inclusionsOnly
        ? findTogglInclusions(userGroups)
        : userGroups;

      const userGroupsByWorkspaceId = groupByWorkspace(
        userGroupsToUse,
      ) as Record<string, UserGroupModel[]>;

      return Object.entries(userGroupsByWorkspaceId).reduce(
        (acc, [workspaceId, workspaceUserGroups]) => {
          const workspaceUsers = get(usersByWorkspaceId, workspaceId, []);

          return {
            ...acc,
            [workspaceId]: appendUserGroupEntryCount(
              workspaceUserGroups,
              workspaceUsers,
            ),
          };
        },
        {},
      );
    },
  );

export const selectUserGroupsTransferPayloadForWorkspace = createSelector(
  selectTogglUserGroupsByWorkspaceFactory(true),
  inclusionsByWorkspaceId => (
    workspaceIdToGet: string,
  ): CreateNamedEntityRequest[] => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as UserGroupModel[];
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { workspaceId, name }) => {
      if (workspaceId !== workspaceIdToGet) return acc;
      return [...acc, { name }];
    }, []);
  },
);
