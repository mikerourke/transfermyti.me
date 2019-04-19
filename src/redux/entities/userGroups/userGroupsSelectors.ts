import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import {
  CompoundUserGroupModel,
  EntityWithName,
  ReduxState,
} from '~/types';

export const selectTogglUserGroups = createSelector(
  (state: ReduxState) => state.entities.userGroups.toggl.byId,
  (userGroupsById): Array<CompoundUserGroupModel> =>
    Object.values(userGroupsById).filter(({ name }) => !/Admin/gi.test(name)),
);

export const selectTogglUserGroupsByWorkspaceFactory = (
  inclusionsOnly: boolean,
) =>
  createSelector(
    selectTogglUserGroups,
    (userGroups): Record<string, Array<CompoundUserGroupModel>> => {
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
  ): Array<EntityWithName> => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as Array<CompoundUserGroupModel>;
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { workspaceId, name }) => {
      if (workspaceId !== workspaceIdToGet) return acc;
      return [...acc, { name }];
    }, []);
  },
);
