import { createSelector } from "reselect";
import { get } from "lodash";
import { findTogglInclusions } from "~/redux/utils";
import { selectCredentials } from "~/redux/credentials/credentialsSelectors";
import { selectTogglTimeEntriesById } from "~/redux/entities/timeEntries/timeEntriesSelectors";
import { CompoundUserModel, ReduxState } from "~/types";

export const selectClockifyUsersById = createSelector(
  (state: ReduxState) => state.entities.users.clockify.byId,
  usersById => usersById,
);

export const selectClockifyUsersByWorkspace = createSelector(
  selectClockifyUsersById,
  (state: ReduxState) => Object.values(state.entities.workspaces.clockify.byId),
  (usersById, workspaces): Record<string, Array<CompoundUserModel>> =>
    workspaces.reduce(
      (acc, workspace) => ({
        ...acc,
        [workspace.id]: workspace.userIds.map(userId => get(usersById, userId)),
      }),
      {},
    ),
);

export const selectTogglUsersById = createSelector(
  (state: ReduxState) => state.entities.users.toggl.byId,
  (usersById): Record<string, CompoundUserModel> => usersById,
);

export const selectTogglUsersByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectCredentials,
    selectTogglUsersById,
    selectTogglTimeEntriesById,
    (state: ReduxState) => state.entities.workspaces.toggl.byId,
    (
      { togglUserId },
      usersById,
      timeEntriesById,
      workspacesById,
    ): Record<string, Array<CompoundUserModel>> => {
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
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { email }) => {
      if (email === togglEmail) return acc;
      return [...acc, email];
    }, []);
  },
);

function getValidUsers(
  usersById: Record<string, CompoundUserModel>,
  userIds: Array<string>,
  meUserId: string,
) {
  return userIds.reduce((acc, userId) => {
    const userRecord = get(usersById, userId, { linkedId: null });
    if (userId === meUserId) return acc;

    return [...acc, userRecord];
  }, []);
}
