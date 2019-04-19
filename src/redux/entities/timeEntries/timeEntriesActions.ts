import { createAsyncAction, createStandardAction } from 'typesafe-actions';
import { flatten } from 'lodash';
import {
  batchClockifyTransferRequests,
  buildThrottler,
  getValidEntities,
} from '~/redux/utils';
import {
  apiCreateClockifyTimeEntry,
  apiFetchClockifyTimeEntries,
  apiFetchTogglTimeEntries,
} from '~/redux/entities/api/timeEntries';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import { selectCurrentTransferType } from '~/redux/app/appSelectors';
import { selectCredentials } from '~/redux/credentials/credentialsSelectors';
import { selectEntitiesByGroupFactory } from '~/redux/entities/entitiesSelectors';
import { calculateUserGroupEntryCounts } from '~/redux/entities/userGroups/userGroupsActions';
import {
  selectClockifyUsersById,
  selectTogglUsersById,
} from '~/redux/entities/users/usersSelectors';
import { selectTogglWorkspaceIncludedYears } from '~/redux/entities/workspaces/workspacesSelectors';
import { TimeEntryTransform } from './TimeEntryTransform';
import { TimeEntriesState } from './timeEntriesReducer';
import { selectTimeEntriesForWorkspace } from './timeEntriesSelectors';
import {
  ClockifyTimeEntryModel,
  CompoundTimeEntryModel,
  EntitiesByGroupModel,
  EntityGroup,
  ReduxDispatch,
  ReduxGetState,
  TogglTimeEntryModel,
  ToolName,
  TransferType,
} from '~/types';

type TimeEntryForTool = ClockifyTimeEntryModel | TogglTimeEntryModel;

export const clockifyTimeEntriesFetch = createAsyncAction(
  '@timeEntries/CLOCKIFY_FETCH_REQUEST',
  '@timeEntries/CLOCKIFY_FETCH_SUCCESS',
  '@timeEntries/CLOCKIFY_FETCH_FAILURE',
)<void, Array<CompoundTimeEntryModel>, void>();

export const togglTimeEntriesFetch = createAsyncAction(
  '@timeEntries/TOGGL_FETCH_REQUEST',
  '@timeEntries/TOGGL_FETCH_SUCCESS',
  '@timeEntries/TOGGL_FETCH_FAILURE',
)<void, Array<CompoundTimeEntryModel>, void>();

export const clockifyTimeEntriesTransfer = createAsyncAction(
  '@timeEntries/CLOCKIFY_TRANSFER_REQUEST',
  '@timeEntries/CLOCKIFY_TRANSFER_SUCCESS',
  '@timeEntries/CLOCKIFY_TRANSFER_FAILURE',
)<void, Array<CompoundTimeEntryModel>, void>();

export const flipIsTimeEntryIncluded = createStandardAction(
  '@timeEntries/FLIP_IS_INCLUDED',
)<string>();

export const addLinksToTimeEntries = createStandardAction(
  '@timeEntries/ADD_LINKS_TO_TIME_ENTRIES',
)<TimeEntriesState>();

export const fetchClockifyTimeEntries = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(clockifyTimeEntriesFetch.request());

  try {
    const state = getState();
    const { clockifyUserId } = selectCredentials(state);
    const includedYears = selectTogglWorkspaceIncludedYears(state, workspaceId);

    const clockifyTimeEntries = await fetchClockifyTimeEntriesForIncludedYears({
      userId: clockifyUserId,
      workspaceId,
      years: includedYears,
    });

    const usersById = selectClockifyUsersById(state);
    const timeEntries = convertToCompoundTimeEntries({
      workspaceId,
      timeEntries: clockifyTimeEntries,
      entitiesByGroup: selectEntitiesByGroupFactory(ToolName.Clockify)(state),
    });

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

export const fetchTogglTimeEntries = (
  workspaceId: string,
  year: number,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  dispatch(togglTimeEntriesFetch.request());

  try {
    const state = getState();
    const { togglEmail, togglUserId } = selectCredentials(state);

    const allTimeEntries = await fetchAllTogglTimeEntries({
      togglEmail,
      workspaceId,
      year,
    });

    const usersById = selectTogglUsersById(state);
    const compoundTimeEntries = convertToCompoundTimeEntries({
      workspaceId,
      timeEntries: allTimeEntries,
      entitiesByGroup: selectEntitiesByGroupFactory(ToolName.Toggl)(state),
    });

    const currentTransferType = selectCurrentTransferType(state);
    const timeEntries =
      currentTransferType === TransferType.SingleUser
        ? compoundTimeEntries.filter(({ userId }) => userId === togglUserId)
        : compoundTimeEntries;

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

export const transferTimeEntriesToClockify = (
  togglWorkspaceId: string,
  clockifyWorkspaceId: string,
) => async (dispatch: ReduxDispatch, getState: ReduxGetState) => {
  const state = getState();
  const timeEntriesInWorkspace = selectTimeEntriesForWorkspace(state)(
    togglWorkspaceId,
  );
  if (timeEntriesInWorkspace.length === 0) return Promise.resolve();

  dispatch(clockifyTimeEntriesTransfer.request());

  try {
    const clockifyTimeEntries = await batchClockifyTransferRequests({
      requestsPerSecond: 10,
      dispatch,
      entityGroup: EntityGroup.TimeEntries,
      entityRecordsInWorkspace: timeEntriesInWorkspace,
      apiFunc: apiCreateClockifyTimeEntry,
      workspaceId: clockifyWorkspaceId,
    });

    const timeEntries = convertToCompoundTimeEntries({
      workspaceId: clockifyWorkspaceId,
      timeEntries: clockifyTimeEntries,
      entitiesByGroup: selectEntitiesByGroupFactory(ToolName.Clockify)(state),
    });

    return dispatch(clockifyTimeEntriesTransfer.success(timeEntries));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTimeEntriesTransfer.failure());
  }
};

async function fetchClockifyTimeEntriesForIncludedYears({
  userId,
  workspaceId,
  years,
}: {
  userId: string;
  workspaceId: string;
  years: Array<number>;
}): Promise<Array<ClockifyTimeEntryModel>> {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    4,
    apiFetchClockifyTimeEntries,
  );

  const allYearsTimeEntries: Array<Array<ClockifyTimeEntryModel>> = [];
  for (const year of years) {
    await promiseThrottle
      .add(
        // @ts-ignore
        throttledFunc.bind(this, userId, workspaceId, year),
      )
      .then((yearEntries: Array<ClockifyTimeEntryModel>) => {
        allYearsTimeEntries.push(yearEntries);
      });
  }

  return flatten(allYearsTimeEntries);
}

async function fetchAllTogglTimeEntries({
  togglEmail,
  workspaceId,
  year,
}: {
  togglEmail: string;
  workspaceId: string;
  year: number;
}) {
  const {
    total_count: totalCount,
    per_page: perPage,
    data: firstPageEntries,
  } = await apiFetchTogglTimeEntries(togglEmail, workspaceId, year, 1);

  const totalPages = Math.ceil(totalCount / perPage);

  const remainingPageEntries = await fetchTogglTimeEntriesForRemainingPages({
    email: togglEmail,
    workspaceId,
    year,
    totalPages,
  });

  return [...firstPageEntries, ...remainingPageEntries];
}

async function fetchTogglTimeEntriesForRemainingPages({
  email,
  workspaceId,
  year,
  totalPages,
}: {
  email: string;
  workspaceId: string;
  year: number;
  totalPages: number;
}): Promise<Array<TogglTimeEntryModel>> {
  const { promiseThrottle, throttledFunc } = buildThrottler(
    4,
    apiFetchTogglTimeEntries,
  );

  const timeEntriesForPage: Array<Array<TogglTimeEntryModel>> = [];
  let currentPage = totalPages;

  // We already got the first page, don't want to fetch again:
  while (currentPage > 1) {
    await promiseThrottle
      .add(
        // @ts-ignore
        throttledFunc.bind(this, email, workspaceId, year, currentPage),
      )
      .then(({ data }: { data: Array<TogglTimeEntryModel> }) => {
        timeEntriesForPage.push(data);
      });
    currentPage -= 1;
  }

  return flatten(timeEntriesForPage);
}

function convertToCompoundTimeEntries({
  workspaceId,
  timeEntries,
  entitiesByGroup,
}: {
  workspaceId: string;
  timeEntries: Array<TimeEntryForTool>;
  entitiesByGroup: EntitiesByGroupModel;
}): Array<CompoundTimeEntryModel> {
  if (getValidEntities(timeEntries).length === 0) return [];

  return timeEntries.map(timeEntry => {
    const transform = new TimeEntryTransform(timeEntry);
    return transform.compound(workspaceId, entitiesByGroup);
  });
}
