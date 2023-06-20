import { isNil } from "ramda";

import { createSelector } from "~/redux/reduxTools";
import { activeWorkspaceIdSelector } from "~/redux/workspaces/workspaces.selectors";
import type { ReduxState, UserGroup } from "~/types";

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
      isNil(sourceUserGroup.linkedId),
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
