import { createSelector } from "reselect";
import * as R from "ramda";
import {
  activeWorkspaceIdSelector,
  workspaceIdMappingSelector,
} from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { UserModel } from "./usersTypes";

export const sourceUsersSelector = createSelector(
  (state: ReduxState) => state.users.source,
  (sourceUsersById): UserModel[] => Object.values(sourceUsersById),
);

export const includedSourceUsersSelector = createSelector(
  sourceUsersSelector,
  (sourceUsers): UserModel[] =>
    sourceUsers.filter(sourceUser => sourceUser.isIncluded),
);

export const sourceUsersForTransferSelector = createSelector(
  includedSourceUsersSelector,
  (sourceUsers): UserModel[] =>
    sourceUsers.filter(sourceUser => R.isNil(sourceUser.linkedId)),
);

export const sourceUserEmailsByWorkspaceIdSelector = createSelector(
  sourceUsersSelector,
  workspaceIdMappingSelector,
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

export const sourceUsersInActiveWorkspaceSelector = createSelector(
  sourceUsersSelector,
  activeWorkspaceIdSelector,
  (sourceUsers, workspaceId): UserModel[] =>
    sourceUsers.filter(user => user.workspaceId === workspaceId),
);
