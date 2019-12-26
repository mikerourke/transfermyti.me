import { createSelector } from "reselect";
import * as R from "ramda";
import {
  selectActiveWorkspaceId,
  selectWorkspaceIdMapping,
} from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { UserModel } from "./usersTypes";

export const selectSourceUsers = createSelector(
  (state: ReduxState) => state.users.source,
  (usersById): UserModel[] => Object.values(usersById),
);

export const selectSourceUsersForTransfer = createSelector(
  selectSourceUsers,
  (sourceUsers): UserModel[] =>
    sourceUsers.filter(sourceUser =>
      R.and(sourceUser.isIncluded, R.isNil(sourceUser.linkedId)),
    ),
);

export const selectSourceUserEmailsByWorkspaceId = createSelector(
  selectSourceUsers,
  selectWorkspaceIdMapping,
  (sourceUsers, workspaceIdMapping) => {
    const emailsByWorkspaceId: Record<string, string[]> = {};

    for (const sourceUser of sourceUsers) {
      const targetWorkspaceId = R.propOr<null, Record<string, string>, string>(
        null,
        R.propOr("", "workspaceId", sourceUser) as string,
        workspaceIdMapping,
      );

      if (!R.isNil(targetWorkspaceId)) {
        const emailsInWorkspace = emailsByWorkspaceId[targetWorkspaceId] ?? [];
        emailsByWorkspaceId[targetWorkspaceId] = [
          ...emailsInWorkspace,
          sourceUser.email,
        ];
      }
    }

    return emailsByWorkspaceId;
  },
);

export const selectSourceUsersInActiveWorkspace = createSelector(
  selectSourceUsers,
  selectActiveWorkspaceId,
  (sourceUsers, workspaceId): UserModel[] =>
    sourceUsers.filter(user => user.workspaceId === workspaceId),
);
