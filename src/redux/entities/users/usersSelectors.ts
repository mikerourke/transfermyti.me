import { createSelector } from 'reselect';
import get from 'lodash/get';
import { UserModel } from '../../../types/usersTypes';
import { State } from '../../rootReducer';
import { selectCredentials } from '../../credentials/credentialsSelectors';

export const selectTogglUsersById = createSelector(
  (state: State) => state.entities.users.toggl.usersById,
  usersById => usersById,
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

export const selectTogglUserRecordsByWorkspaceId = createSelector(
  [
    selectTogglUsersById,
    selectTogglMeUserId,
    (state: State) => state.entities.workspaces.toggl.workspacesById,
  ],
  (usersById, meUserId, workspacesById): Record<string, UserModel[]> => {
    const getValidUserRecords = (userIds: string[]) =>
      userIds.reduce((acc, userId) => {
        if (userId === meUserId) return acc;
        return [...acc, get(usersById, userId, {})];
      }, []);

    return Object.values(workspacesById).reduce(
      (acc, { id, userIds }) => ({
        ...acc,
        [id]: getValidUserRecords(userIds),
      }),
      {},
    );
  },
);
