import { createSelector } from "reselect";
import * as R from "ramda";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { UserGroupModel } from "./userGroupsTypes";

export const selectSourceUserGroups = createSelector(
  (state: ReduxState) => state.userGroups.source,
  (userGroupsById): UserGroupModel[] =>
    Object.values(userGroupsById).filter(({ name }) => !/Admin/gi.test(name)),
);

export const selectIncludedSourceUserGroups = createSelector(
  selectSourceUserGroups,
  (sourceUserGroups): UserGroupModel[] =>
    sourceUserGroups.filter(sourceUserGroup => sourceUserGroup.isIncluded),
);

export const selectSourceUserGroupsForTransfer = createSelector(
  selectSourceUserGroups,
  (sourceUserGroups): UserGroupModel[] =>
    sourceUserGroups.filter(sourceUserGroup =>
      R.isNil(sourceUserGroup.linkedId),
    ),
);

export const selectSourceUserGroupsInActiveWorkspace = createSelector(
  selectSourceUserGroups,
  selectActiveWorkspaceId,
  (sourceUserGroups, workspaceId): UserGroupModel[] =>
    sourceUserGroups.filter(userGroup => userGroup.workspaceId === workspaceId),
);
