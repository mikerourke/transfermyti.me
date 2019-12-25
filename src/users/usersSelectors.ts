import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { UserModel } from "~/users/usersTypes";

export const selectSourceUsers = createSelector(
  (state: ReduxState) => state.users.source,
  (usersById): UserModel[] => Object.values(usersById),
);

const selectSourceUsersInWorkspace = createSelector(
  selectSourceUsers,
  (_: unknown, workspaceId: string) => workspaceId,
  (sourceUsers, workspaceId): UserModel[] =>
    sourceUsers.filter(user => user.workspaceId === workspaceId),
);

export const selectSourceUsersForTransfer = createSelector(
  selectSourceUsersInWorkspace,
  (sourceUsers): UserModel[] => sourceUsers.filter(user => user.isIncluded),
);
