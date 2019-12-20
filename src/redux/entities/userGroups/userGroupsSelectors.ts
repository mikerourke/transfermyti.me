import { createSelector, Selector } from "reselect";
import { get } from "lodash";
import { findTogglInclusions, groupByWorkspace } from "~/redux/utils";
import {
  CompoundUserGroupModel,
  EntityGroupsByKey,
  EntityWithName,
  ReduxState,
} from "~/types";

export const selectTogglUserGroups = createSelector(
  (state: ReduxState) => state.entities.userGroups.toggl.byId,
  (userGroupsById): Array<CompoundUserGroupModel> =>
    Object.values(userGroupsById).filter(({ name }) => !/Admin/gi.test(name)),
);

export const selectTogglUserGroupsByWorkspaceFactory = (
  inclusionsOnly: boolean,
): Selector<ReduxState, EntityGroupsByKey<CompoundUserGroupModel>> =>
  createSelector(
    selectTogglUserGroups,
    (userGroups): EntityGroupsByKey<CompoundUserGroupModel> => {
      const userGroupsToUse = inclusionsOnly
        ? findTogglInclusions(userGroups)
        : userGroups;

      return groupByWorkspace(userGroupsToUse);
    },
  );

export const selectUserGroupsTransferPayloadForWorkspace = createSelector(
  selectTogglUserGroupsByWorkspaceFactory(true),
  inclusionsByWorkspace => (
    workspaceIdToGet: string,
  ): Array<EntityWithName> => {
    const inclusions = get(
      inclusionsByWorkspace,
      workspaceIdToGet,
      [],
    ) as Array<CompoundUserGroupModel>;
    if (inclusions.length === 0) {
      return [];
    }

    return inclusions.reduce((acc, { workspaceId, name }) => {
      if (workspaceId !== workspaceIdToGet) {
        return acc;
      }
      return [...acc, { name }];
    }, []);
  },
);
