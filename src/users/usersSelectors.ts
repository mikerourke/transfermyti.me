import { createSelector, Selector } from "reselect";
import { get } from "lodash";
import { findTogglInclusions } from "~/utils";
import { selectCredentials } from "~/credentials/credentialsSelectors";
import { selectTogglTimeEntriesById } from "~/timeEntries/timeEntriesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { CompoundUserModel } from "~/users/usersTypes";
import { EntityGroupsByKey } from "~/common/commonTypes";

export const selectClockifyUsersById = createSelector(
  (state: ReduxState) => state.users.clockify.byId,
  usersById => usersById,
);

export const selectClockifyUsersByWorkspace = createSelector(
  selectClockifyUsersById,
  (state: ReduxState) => Object.values(state.workspaces.clockify.byId),
  (usersById, workspaces): EntityGroupsByKey<CompoundUserModel> =>
    workspaces.reduce(
      (acc, workspace) => ({
        ...acc,
        [workspace.id]: workspace.userIds.map(userId => get(usersById, userId)),
      }),
      {},
    ),
);

export const selectTogglUsersById = createSelector(
  (state: ReduxState) => state.users.toggl.byId,
  (usersById): Record<string, CompoundUserModel> => usersById,
);

export const selectTogglUsersByWorkspaceFactory = (
  inclusionsOnly: boolean,
): Selector<ReduxState, EntityGroupsByKey<CompoundUserModel>> =>
  createSelector(
    selectCredentials,
    selectTogglUsersById,
    selectTogglTimeEntriesById,
    (state: ReduxState) => state.workspaces.toggl.byId,
    (
      { togglUserId },
      usersById,
      timeEntriesById,
      workspacesById,
    ): EntityGroupsByKey<CompoundUserModel> => {
      return Object.values(workspacesById).reduce((acc, { id, userIds }) => {
        const validUsers = getValidUsers(usersById, userIds, togglUserId);
        const usersToUse = inclusionsOnly
          ? findTogglInclusions(validUsers)
          : validUsers;

        return {
          ...acc,
          [id]: usersToUse,
        };
      }, {});
    },
  );

export const selectUsersInvitePayloadForWorkspace = createSelector(
  selectTogglUsersByWorkspaceFactory(true),
  selectCredentials,
  (inclusionsByWorkspace, { togglEmail }) => (
    workspaceIdToGet: string,
  ): Array<string> => {
    const inclusions = get(
      inclusionsByWorkspace,
      workspaceIdToGet,
      [],
    ) as Array<CompoundUserModel>;
    if (inclusions.length === 0) {
      return [];
    }

    return inclusions.reduce((acc, { email }) => {
      if (email === togglEmail) {
        return acc;
      }
      return [...acc, email];
    }, []);
  },
);

function getValidUsers(
  usersById: Record<string, CompoundUserModel>,
  userIds: Array<string>,
  meUserId: string,
): Array<CompoundUserModel> {
  return userIds.reduce((acc, userId) => {
    const userRecord = get(usersById, userId, { linkedId: null });
    if (userId === meUserId) {
      return acc;
    }

    return [...acc, userRecord];
  }, []);
}
