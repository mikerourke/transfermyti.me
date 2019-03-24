import { createAsyncAction } from 'typesafe-actions';
import { flatten, get, isNil, isString } from 'lodash';
import { buildThrottler, findIdFieldValue } from '~/redux/utils';
import {
  apiFetchClockifyTimeEntries,
  apiFetchTogglTimeEntries,
} from '../api/timeEntries';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectTogglClients } from '~/redux/entities/clients/clientsSelectors';
import {
  selectClockifyUserId,
  selectTogglUserEmail,
} from '~/redux/credentials/credentialsSelectors';
import { calculateUserGroupEntryCounts } from '~/redux/entities/userGroups/userGroupsActions';
import {
  selectClockifyUsersById,
  selectTogglUsersById,
} from '~/redux/entities/users/usersSelectors';
import { selectTogglWorkspaceIncludedYears } from '~/redux/entities/workspaces/workspacesSelectors';
import { ReduxDispatch, ReduxGetState, ToolName } from '~/types/commonTypes';
import { ClientModel } from '~/types/clientsTypes';
import { EntityType } from '~/types/entityTypes';
import {
  ClockifyTimeEntry,
  TimeEntryModel,
  TogglTimeEntry,
} from '~/types/timeEntriesTypes';
import { UserModel } from '~/types/usersTypes';

export const clockifyTimeEntriesFetch = createAsyncAction(
  '@timeEntries/CLOCKIFY_FETCH_REQUEST',
  '@timeEntries/CLOCKIFY_FETCH_SUCCESS',
  '@timeEntries/CLOCKIFY_FETCH_FAILURE',
)<void, TimeEntryModel[], void>();

export const togglTimeEntriesFetch = createAsyncAction(
  '@timeEntries/TOGGL_FETCH_REQUEST',
  '@timeEntries/TOGGL_FETCH_SUCCESS',
  '@timeEntries/TOGGL_FETCH_FAILURE',
)<void, TimeEntryModel[], void>();

const fetchClockifyTimeEntriesForIncludedYears = async (
  userId: string,
  workspaceId: string,
  years: number[],
): Promise<ClockifyTimeEntry[]> => {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    apiFetchClockifyTimeEntries,
  );

  const allYearsTimeEntries: ClockifyTimeEntry[][] = [];

  for (const year of years) {
    await promiseThrottle
      .add(
        // @ts-ignore
        throttledFunc.bind(this, userId, workspaceId, year),
      )
      .then((yearEntries: ClockifyTimeEntry[]) => {
        allYearsTimeEntries.push(yearEntries);
      });
  }

  return flatten(allYearsTimeEntries);
};

const getTimeValue = (value: any, field: string): Date | null => {
  const timeValue =
    'timeInterval' in value
      ? get(value, ['timeInterval', field], null)
      : get(value, field, null);
  return isNil(timeValue) ? null : new Date(timeValue);
};

const convertTimeEntriesFromToolToUniversal = (
  workspaceId: string,
  timeEntries: (ClockifyTimeEntry | TogglTimeEntry)[],
  clients: ClientModel[] | null,
  usersById: Record<string, UserModel> | null,
): TimeEntryModel[] =>
  timeEntries.map(timeEntry => {
    let clientId = null;

    if ('client' in timeEntry && !isNil(clients)) {
      const matchingClient = clients.find(
        ({ name }) => name === timeEntry.client,
      );
      clientId = isNil(matchingClient) ? null : matchingClient.id;
    }

    const userId = findIdFieldValue(timeEntry, EntityType.User);
    let userGroupIds: string[] = [];
    if (!isNil(usersById)) {
      userGroupIds = get(usersById, [userId, 'userGroupIds'], []);
    }

    return {
      id: timeEntry.id.toString(),
      description: timeEntry.description,
      projectId: findIdFieldValue(timeEntry, EntityType.Project),
      taskId: findIdFieldValue(timeEntry, EntityType.Task),
      userId,
      userGroupIds,
      workspaceId,
      client:
        'client' in timeEntry
          ? timeEntry.client
          : get(timeEntry, ['project', 'clientName'], null),
      clientId,
      isBillable:
        'is_billable' in timeEntry ? timeEntry.is_billable : timeEntry.billable,
      start: getTimeValue(timeEntry, 'start'),
      end: getTimeValue(timeEntry, 'end'),
      tags: isNil(timeEntry.tags)
        ? []
        : timeEntry.tags.map((tag: any) =>
            isString(tag) ? tag : get(tag, 'name'),
          ),
      tagIds: [],
      name: null,
      linkedId: null,
      isIncluded: true,
    };
  });

export const fetchClockifyTimeEntries = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(clockifyTimeEntriesFetch.request());
  try {
    const state = getState();
    const userId = selectClockifyUserId(state);
    const usersById = selectClockifyUsersById(state);
    const includedYears = selectTogglWorkspaceIncludedYears(state, workspaceId);

    const clockifyTimeEntries = await fetchClockifyTimeEntriesForIncludedYears(
      userId,
      workspaceId,
      includedYears,
    );

    const timeEntries = convertTimeEntriesFromToolToUniversal(
      workspaceId,
      clockifyTimeEntries,
      null,
      usersById,
    );

    dispatch(
      calculateUserGroupEntryCounts({
        toolName: ToolName.Clockify,
        timeEntries,
        usersById,
      }),
    );
    return dispatch(clockifyTimeEntriesFetch.success(timeEntries));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTimeEntriesFetch.failure());
  }
};

const fetchTogglTimeEntriesForRemainingPages = async (
  email: string,
  workspaceId: string,
  year: number,
  totalPages: number,
): Promise<TogglTimeEntry[]> => {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    apiFetchTogglTimeEntries,
  );

  const timeEntriesForPage: TogglTimeEntry[][] = [];
  let currentPage = totalPages;

  // We already got the first page, don't want to fetch again:
  while (currentPage > 1) {
    await promiseThrottle
      .add(
        // @ts-ignore
        throttledFunc.bind(this, email, workspaceId, year, currentPage),
      )
      .then(({ data }: { data: TogglTimeEntry[] }) => {
        timeEntriesForPage.push(data);
      });
    currentPage -= 1;
  }

  return flatten(timeEntriesForPage);
};

export const fetchTogglTimeEntries = (
  workspaceId: string,
  year: number,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  dispatch(togglTimeEntriesFetch.request());

  try {
    const state = getState();
    const email = selectTogglUserEmail(state);
    const usersById = selectTogglUsersById(state);

    const {
      total_count,
      per_page,
      data: firstPageEntries,
    } = await apiFetchTogglTimeEntries(email, workspaceId, year, 1);

    const totalPages = Math.ceil(total_count / per_page);

    const remainingPageEntries = await fetchTogglTimeEntriesForRemainingPages(
      email,
      workspaceId,
      year,
      totalPages,
    );

    const allTimeEntries = [...firstPageEntries, ...remainingPageEntries];
    const togglClients = selectTogglClients(state);
    const timeEntries = convertTimeEntriesFromToolToUniversal(
      workspaceId,
      allTimeEntries,
      togglClients,
      usersById,
    );

    dispatch(
      calculateUserGroupEntryCounts({
        toolName: ToolName.Toggl,
        timeEntries,
        usersById,
      }),
    );
    return dispatch(togglTimeEntriesFetch.success(timeEntries));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTimeEntriesFetch.failure());
  }
};
