import { createAsyncAction } from 'typesafe-actions';
import { flatten } from 'lodash';
import { buildThrottler } from '~/redux/utils';
import {
  apiFetchClockifyTimeEntries,
  apiFetchTogglTimeEntries,
} from '../api/timeEntries';
import { showFetchErrorNotification } from '~/redux/app/appActions';
import {
  selectClockifyUserId,
  selectTogglUserEmail,
} from '~/redux/credentials/credentialsSelectors';
import { selectTogglWorkspaceIncludedYears } from '~/redux/entities/workspaces/workspacesSelectors';
import { ReduxDispatch, ReduxGetState } from '~/types/commonTypes';
import { ClockifyTimeEntry, TogglTimeEntry } from '~/types/timeEntriesTypes';

export const clockifyTimeEntriesFetch = createAsyncAction(
  '@timeEntries/CLOCKIFY_FETCH_REQUEST',
  '@timeEntries/CLOCKIFY_FETCH_SUCCESS',
  '@timeEntries/CLOCKIFY_FETCH_FAILURE',
)<void, ClockifyTimeEntry[], void>();

export const togglTimeEntriesFetch = createAsyncAction(
  '@timeEntries/TOGGL_FETCH_REQUEST',
  '@timeEntries/TOGGL_FETCH_SUCCESS',
  '@timeEntries/TOGGL_FETCH_FAILURE',
)<void, TogglTimeEntry[], void>();

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

export const fetchClockifyTimeEntries = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  const state = getState();

  dispatch(clockifyTimeEntriesFetch.request());

  const userId = selectClockifyUserId(state);
  const includedYears = selectTogglWorkspaceIncludedYears(state, workspaceId);
  try {
    const timeEntries = await fetchClockifyTimeEntriesForIncludedYears(
      userId,
      workspaceId,
      includedYears,
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
  const state = getState();

  dispatch(togglTimeEntriesFetch.request());
  const email = selectTogglUserEmail(state);

  try {
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
    return dispatch(togglTimeEntriesFetch.success(allTimeEntries));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTimeEntriesFetch.failure());
  }
};
