import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { UserModel } from "~/users/usersTypes";

export const selectTargetUsers = createSelector(
  (state: ReduxState) => state.users.target,
  (usersById): UserModel[] => Object.values(usersById),
);

const selectTargetUsersInWorkspace = createSelector(
  selectTargetUsers,
  (_: unknown, workspaceId: string) => workspaceId,
  (targetUsers, workspaceId): UserModel[] =>
    targetUsers.filter(user => user.workspaceId === workspaceId),
);

export const selectTargetUsersForTransfer = createSelector(
  selectTargetUsersInWorkspace,
  (targetUsers): UserModel[] => targetUsers.filter(user => user.isIncluded),
);
