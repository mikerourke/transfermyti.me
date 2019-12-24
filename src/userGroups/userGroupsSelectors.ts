import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { UserGroupModel } from "./userGroupsTypes";

export const selectTargetUserGroups = createSelector(
  (state: ReduxState) => state.userGroups.target,
  (userGroupsById): UserGroupModel[] =>
    Object.values(userGroupsById).filter(({ name }) => !/Admin/gi.test(name)),
);

const selectTargetUserGroupsInWorkspace = createSelector(
  selectTargetUserGroups,
  (_: unknown, workspaceId: string) => workspaceId,
  (targetUserGroups, workspaceId): UserGroupModel[] =>
    targetUserGroups.filter(userGroup => userGroup.workspaceId === workspaceId),
);

export const selectTargetUserGroupsForTransfer = createSelector(
  selectTargetUserGroupsInWorkspace,
  (targetUserGroups): UserGroupModel[] =>
    targetUserGroups.filter(userGroup => userGroup.isIncluded),
);
