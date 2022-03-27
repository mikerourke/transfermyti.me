import { isNil, propOr } from "ramda";
import { createSelector } from "reselect";

import { selectIdToLinkedId } from "~/entityOperations/selectIdToLinkedId";
import { workspaceIdToLinkedIdSelector } from "~/modules/workspaces/workspacesSelectors";
import type { ReduxState, User } from "~/typeDefs";

const sourceUsersByIdSelector = createSelector(
  (state: ReduxState) => state.users.source,
  (sourceUsersById): Dictionary<User> => sourceUsersById,
);

export const sourceUsersSelector = createSelector(
  sourceUsersByIdSelector,
  (sourceUsersById): User[] => Object.values(sourceUsersById),
);

export const includedSourceUsersSelector = createSelector(
  sourceUsersSelector,
  (sourceUsers): User[] =>
    sourceUsers.filter((sourceUser) => sourceUser.isIncluded),
);

export const userIdToLinkedIdSelector = createSelector(
  sourceUsersByIdSelector,
  (sourceUsersById): Dictionary<string> => selectIdToLinkedId(sourceUsersById),
);

export const sourceUsersForTransferSelector = createSelector(
  includedSourceUsersSelector,
  (sourceUsers): User[] =>
    sourceUsers.filter((sourceUser) => isNil(sourceUser.linkedId)),
);

export const sourceUserEmailsByWorkspaceIdSelector = createSelector(
  sourceUsersSelector,
  workspaceIdToLinkedIdSelector,
  (sourceUsers, workspaceIdToLinkedId): Dictionary<string[]> => {
    const emailsByWorkspaceId: Dictionary<string[]> = {};

    for (const sourceUser of sourceUsers) {
      const targetWorkspaceId = propOr<null, Dictionary<string>, string>(
        null,
        propOr("", "workspaceId", sourceUser) as string,
        workspaceIdToLinkedId,
      );

      if (!isNil(targetWorkspaceId)) {
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
