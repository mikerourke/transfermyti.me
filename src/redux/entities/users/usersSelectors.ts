import { createSelector } from 'reselect';
import { get } from 'lodash';
import { appendTimeEntryCount, findTogglInclusions } from '~/redux/utils';
import { selectCredentials } from '~/redux/credentials/credentialsSelectors';
import { selectTogglTimeEntriesById } from '~/redux/entities/timeEntries/timeEntriesSelectors';
import { ReduxState } from '~/types/commonTypes';
import { EntityType } from '~/types/entityTypes';
import { UserModel } from '~/types/usersTypes';

export const selectTogglUsersById = createSelector(
  (state: ReduxState) => state.entities.users.toggl.byId,
  (usersById): Record<string, UserModel> => usersById,
);

const selectTogglMeUserId = createSelector(
  [selectCredentials, selectTogglUsersById],
  ({ togglEmail }, usersById): string | null => {
    const matchingUser = Object.values(usersById).find(
      ({ email }) => email === togglEmail,
    );
    if (matchingUser) return matchingUser.id;

    return null;
  },
);

const getValidUsers = (
  usersById: Record<string, UserModel>,
  userIds: string[],
  meUserId: string,
) =>
  userIds.reduce((acc, userId) => {
    const userRecord = get(usersById, userId, { linkedId: null });
    if (userId === meUserId) return acc;
    return [...acc, userRecord];
  }, []);

export const selectTogglUsersByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglUsersById,
    selectTogglMeUserId,
    selectTogglTimeEntriesById,
    (state: ReduxState) => state.entities.workspaces.toggl.byId,
    (
      usersById,
      meUserId,
      timeEntriesById,
      workspacesById,
    ): Record<string, UserModel[]> => {
      return Object.values(workspacesById).reduce((acc, { id, userIds }) => {
        const validUsers = getValidUsers(usersById, userIds, meUserId);
        const usersToUse = inclusionsOnly
          ? findTogglInclusions(validUsers)
          : validUsers;

        const usersWithEntryCounts = appendTimeEntryCount(
          EntityType.User,
          usersToUse,
          timeEntriesById,
        );

        return {
          ...acc,
          [id]: usersWithEntryCounts,
        };
      }, {});
    },
  );

export const selectUsersTransferPayloadForWorkspace = createSelector(
  selectTogglUsersByWorkspaceFactory(true),
  selectCredentials,
  (inclusionsByWorkspaceId, { togglEmail }) => (
    workspaceIdToGet: string,
  ): string[] => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as UserModel[];
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { email }) => {
      if (email === togglEmail) return acc;
      return [...acc, email];
    }, []);
  },
);
