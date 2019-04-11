import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { flatten, get, isNil, isString } from 'lodash';
import { buildThrottler, findIdFieldValue } from '~/redux/utils';
import {
  apiFetchClockifyTimeEntries,
  apiFetchTogglTimeEntries,
} from '~/redux/entities/api/timeEntries';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectCurrentTransferType } from '~/redux/app/appSelectors';
import { selectTogglClients } from '~/redux/entities/clients/clientsSelectors';
import { selectCredentials } from '~/redux/credentials/credentialsSelectors';
import { calculateUserGroupEntryCounts } from '~/redux/entities/userGroups/userGroupsActions';
import {
  selectClockifyUsersById,
  selectTogglUsersById,
} from '~/redux/entities/users/usersSelectors';
import { selectTogglWorkspaceIncludedYears } from '~/redux/entities/workspaces/workspacesSelectors';
import { TransferType } from '~/types/appTypes';
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
)<void, Array<TimeEntryModel>, void>();

export const togglTimeEntriesFetch = createAsyncAction(
  '@timeEntries/TOGGL_FETCH_REQUEST',
  '@timeEntries/TOGGL_FETCH_SUCCESS',
  '@timeEntries/TOGGL_FETCH_FAILURE',
)<void, Array<TimeEntryModel>, void>();

export const flipIsTimeEntryIncluded = createStandardAction(
  '@timeEntries/FLIP_IS_INCLUDED',
)<string>();

const fetchClockifyTimeEntriesForIncludedYears = async (
  userId: string,
  workspaceId: string,
  years: Array<number>,
): Promise<Array<ClockifyTimeEntry>> => {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    apiFetchClockifyTimeEntries,
  );

  const allYearsTimeEntries: Array<Array<ClockifyTimeEntry>> = [];

  for (const year of years) {
    await promiseThrottle
      .add(
        // @ts-ignore
        throttledFunc.bind(this, userId, workspaceId, year),
      )
      .then((yearEntries: Array<ClockifyTimeEntry>) => {
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
  timeEntries: Array<ClockifyTimeEntry | TogglTimeEntry>,
  clients: Array<ClientModel> | null,
  usersById: Record<string, UserModel> | null,
): Array<TimeEntryModel> =>
  timeEntries.map(timeEntry => {
    let clientId = null;

    if ('client' in timeEntry && !isNil(clients)) {
      const matchingClient = clients.find(
        ({ name }) => name === timeEntry.client,
      );
      clientId = isNil(matchingClient) ? null : matchingClient.id;
    }

    const userId = findIdFieldValue(timeEntry, EntityType.User);
    let userGroupIds: Array<string> = [];
    if (!isNil(usersById)) {
      userGroupIds = get(usersById, [userId, 'userGroupIds'], []);
    }

    const getTagValue = (tag: any) => (isString(tag) ? tag : get(tag, 'name'));

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
      tags: isNil(timeEntry.tags) ? [] : timeEntry.tags.map(getTagValue),
      isActive: false,
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
    const { clockifyUserId } = selectCredentials(state);
    const includedYears = selectTogglWorkspaceIncludedYears(state, workspaceId);

    const clockifyTimeEntries = await fetchClockifyTimeEntriesForIncludedYears(
      clockifyUserId,
      workspaceId,
      includedYears,
    );

    const usersById = selectClockifyUsersById(state);

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
): Promise<Array<TogglTimeEntry>> => {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    apiFetchTogglTimeEntries,
  );

  const timeEntriesForPage: Array<Array<TogglTimeEntry>> = [];
  let currentPage = totalPages;

  // We already got the first page, don't want to fetch again:
  while (currentPage > 1) {
    await promiseThrottle
      .add(
        // @ts-ignore
        throttledFunc.bind(this, email, workspaceId, year, currentPage),
      )
      .then(({ data }: { data: Array<TogglTimeEntry> }) => {
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
    const { togglEmail, togglUserId } = selectCredentials(state);

    const {
      total_count: totalCount,
      per_page: perPage,
      data: firstPageEntries,
    } = await apiFetchTogglTimeEntries(togglEmail, workspaceId, year, 1);

    const totalPages = Math.ceil(totalCount / perPage);

    const remainingPageEntries = await fetchTogglTimeEntriesForRemainingPages(
      togglEmail,
      workspaceId,
      year,
      totalPages,
    );

    const allTimeEntries = [...firstPageEntries, ...remainingPageEntries];

    const togglClients = selectTogglClients(state);
    const usersById = selectTogglUsersById(state);

    const universalTimeEntries = convertTimeEntriesFromToolToUniversal(
      workspaceId,
      allTimeEntries,
      togglClients,
      usersById,
    );

    const currentTransferType = selectCurrentTransferType(state);
    const timeEntries =
      currentTransferType === TransferType.SingleUser
        ? universalTimeEntries.filter(({ userId }) => userId === togglUserId)
        : universalTimeEntries;

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
