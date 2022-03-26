import * as R from "ramda";
import { createSelector } from "reselect";

import { selectIdToLinkedId } from "~/entityOperations/selectIdToLinkedId";
import { workspaceIdToLinkedIdSelector } from "~/modules/workspaces/workspacesSelectors";
import type { ReduxState, UserModel, UsersByIdModel } from "~/typeDefs";

const sourceUsersByIdSelector = createSelector(
  (state: ReduxState) => state.users.source,
  (sourceUsersById): UsersByIdModel => sourceUsersById,
);

export const sourceUsersSelector = createSelector(
  sourceUsersByIdSelector,
  (sourceUsersById): UserModel[] => Object.values(sourceUsersById),
);

export const includedSourceUsersSelector = createSelector(
  sourceUsersSelector,
  (sourceUsers): UserModel[] =>
    sourceUsers.filter((sourceUser) => sourceUser.isIncluded),
);

export const userIdToLinkedIdSelector = createSelector(
  sourceUsersByIdSelector,
  (sourceUsersById): Record<string, string> =>
    selectIdToLinkedId(sourceUsersById),
);

export const sourceUsersForTransferSelector = createSelector(
  includedSourceUsersSelector,
  (sourceUsers): UserModel[] =>
    sourceUsers.filter((sourceUser) => R.isNil(sourceUser.linkedId)),
);

export const sourceUserEmailsByWorkspaceIdSelector = createSelector(
  sourceUsersSelector,
  workspaceIdToLinkedIdSelector,
  (sourceUsers, workspaceIdToLinkedId): Record<string, string[]> => {
    const emailsByWorkspaceId: Record<string, string[]> = {};

    for (const sourceUser of sourceUsers) {
      const targetWorkspaceId = R.propOr<null, Record<string, string>, string>(
        null,
        R.propOr("", "workspaceId", sourceUser) as string,
        workspaceIdToLinkedId,
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
