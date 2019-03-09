import { createSelector } from 'reselect';
import get from 'lodash/get';
import property from 'lodash/property';
import { getTogglInclusionRecords } from '~/redux/utils';
import { selectCredentials } from '~/redux/credentials/credentialsSelectors';
import { ReduxState } from '~/types/commonTypes';
import { UserModel } from '~/types/usersTypes';
import { WorkspaceModel } from '~/types/workspacesTypes';

export const selectClockifyUsersById = createSelector(
  (state: ReduxState) => state.entities.users.clockify.byId,
  (usersById): Record<string, UserModel> => usersById,
);

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

const getUserRecordsByWorkspaceId = (
  usersById: Record<string, UserModel>,
  meUserId: string,
  workspacesById: Record<string, WorkspaceModel>,
): Record<string, UserModel[]> => {
  const getValidUserRecords = (userIds: string[]) =>
    userIds.reduce((acc, userId) => {
      const userRecord = get(usersById, userId, { linkedId: null });
      if (userId === meUserId) return acc;
      return [...acc, userRecord];
    }, []);

  return Object.values(workspacesById).reduce(
    (acc, { id, userIds }) => ({
      ...acc,
      [id]: getValidUserRecords(userIds),
    }),
    {},
  );
};

export const selectTogglUsersByWorkspaceId = createSelector(
  [
    selectTogglUsersById,
    selectTogglMeUserId,
    (state: ReduxState) => state.entities.workspaces.toggl.byId,
  ],
  (usersById, meUserId, workspacesById): Record<string, UserModel[]> =>
    getUserRecordsByWorkspaceId(usersById, meUserId, workspacesById),
);

export const selectTogglUserInclusionsByWorkspaceId = createSelector(
  selectTogglUsersByWorkspaceId,
  (togglUsersByWorkspaceId): Record<string, UserModel[]> =>
    Object.entries(togglUsersByWorkspaceId).reduce(
      (acc, [workspaceId, userRecords]) => {
        const includedRecords = getTogglInclusionRecords(userRecords);
        return { ...acc, [workspaceId]: includedRecords };
      },
      {},
    ),
);

export const selectUsersTransferPayloadForWorkspace = createSelector(
  [
    selectTogglUserInclusionsByWorkspaceId,
    (_: null, workspaceId: string) => workspaceId,
  ],
  (inclusionsByWorkspaceId, workspaceIdToGet): string[] => {
    const includedRecords = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as UserModel[];
    if (includedRecords.length === 0) return [];

    return includedRecords.map(property('email'));
  },
);
