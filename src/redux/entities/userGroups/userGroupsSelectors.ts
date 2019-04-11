import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { CreateNamedEntityRequest, ReduxState } from '~/types/commonTypes';
import { UserGroupModel } from '~/types/userGroupsTypes';

export const selectClockifyUserGroupsByWorkspace = createSelector(
  (state: ReduxState) => Object.values(state.entities.userGroups.clockify.byId),
  userGroups => groupByWorkspace(userGroups),
);

export const selectTogglUserGroups = createSelector(
  (state: ReduxState) => state.entities.userGroups.toggl.byId,
  (userGroupsById): Array<UserGroupModel> =>
    Object.values(userGroupsById).filter(({ name }) => !/Admin/gi.test(name)),
);

export const selectTogglUserGroupsByWorkspaceFactory = (
  inclusionsOnly: boolean,
) =>
  createSelector(
    selectTogglUserGroups,
    (userGroups): Record<string, Array<UserGroupModel>> => {
      const userGroupsToUse = inclusionsOnly
        ? findTogglInclusions(userGroups)
        : userGroups;

      return groupByWorkspace(userGroupsToUse);
    },
  );

export const selectUserGroupsTransferPayloadForWorkspace = createSelector(
  selectTogglUserGroupsByWorkspaceFactory(true),
  inclusionsByWorkspaceId => (
    workspaceIdToGet: string,
  ): Array<CreateNamedEntityRequest> => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as Array<UserGroupModel>;
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { workspaceId, name }) => {
      if (workspaceId !== workspaceIdToGet) return acc;
      return [...acc, { name }];
    }, []);
  },
);
