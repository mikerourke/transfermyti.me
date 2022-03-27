import * as R from "ramda";
import { createSelector } from "reselect";

import { activeWorkspaceIdSelector } from "~/modules/workspaces/workspacesSelectors";
import type { ReduxState, UserGroup } from "~/typeDefs";

export const sourceUserGroupsSelector = createSelector(
  (state: ReduxState) => state.userGroups.source,
  (userGroupsById): UserGroup[] =>
    Object.values(userGroupsById).filter(({ name }) => !/Admin/gi.test(name)),
);

export const includedSourceUserGroupsSelector = createSelector(
  sourceUserGroupsSelector,
  (sourceUserGroups): UserGroup[] =>
    sourceUserGroups.filter((sourceUserGroup) => sourceUserGroup.isIncluded),
);

export const sourceUserGroupsForTransferSelector = createSelector(
  sourceUserGroupsSelector,
  (sourceUserGroups): UserGroup[] =>
    sourceUserGroups.filter((sourceUserGroup) =>
      R.isNil(sourceUserGroup.linkedId),
    ),
);

export const sourceUserGroupsInActiveWorkspaceSelector = createSelector(
  sourceUserGroupsSelector,
  activeWorkspaceIdSelector,
  (sourceUserGroups, workspaceId): UserGroup[] =>
    sourceUserGroups.filter(
      (userGroup) => userGroup.workspaceId === workspaceId,
    ),
);
