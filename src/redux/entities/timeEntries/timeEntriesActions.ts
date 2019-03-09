import { createAction } from 'redux-actions';
import flatten from 'lodash/flatten';
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
import { ClockifyTimeEntry, TogglTimeEntry } from '~/types/timeEntriesTypes';
import { ReduxDispatch, ReduxGetState } from '~/types/commonTypes';

export const clockifyTimeEntriesFetchStarted = createAction(
  '@timeEntries/CLOCKIFY_FETCH_STARTED',
);
export const clockifyTimeEntriesFetchSuccess = createAction(
  '@timeEntries/CLOCKIFY_FETCH_SUCCESS',
  (timeEntries: ClockifyTimeEntry[]) => timeEntries,
);
export const clockifyTimeEntriesFetchFailure = createAction(
  '@timeEntries/CLOCKIFY_FETCH_FAILURE',
);
export const togglTimeEntriesFetchStarted = createAction(
  '@timeEntries/TOGGL_FETCH_STARTED',
);
export const togglTimeEntriesFetchSuccess = createAction(
  '@timeEntries/TOGGL_FETCH_SUCCESS',
  (timeEntries: TogglTimeEntry[]) => timeEntries,
);
export const togglTimeEntriesFetchFailure = createAction(
  '@timeEntries/TOGGL_FETCH_FAILURE',
);

const fetchClockifyTimeEntriesForIncludedYears = async (
  userId: string,
  workspaceId: string,
  years: number[],
): Promise<ClockifyTimeEntry[]> => {
  const { promiseThrottle, throttledFn } = buildThrottler(
    apiFetchClockifyTimeEntries,
  );

  const allYearsTimeEntries: ClockifyTimeEntry[][] = [];

  for (const year of years) {
    await promiseThrottle
      .add(
        // @ts-ignore
        throttledFn.bind(this, userId, workspaceId, year),
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

  dispatch(clockifyTimeEntriesFetchStarted());

  const userId = selectClockifyUserId(state);
  const includedYears = selectTogglWorkspaceIncludedYears(state, workspaceId);
  try {
    const timeEntries = await fetchClockifyTimeEntriesForIncludedYears(
      userId,
      workspaceId,
      includedYears,
    );
    return dispatch(clockifyTimeEntriesFetchSuccess(timeEntries));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTimeEntriesFetchFailure());
  }
};

const fetchTogglTimeEntriesForRemainingPages = async (
  email: string,
  workspaceId: string,
  year: number,
  totalPages: number,
): Promise<TogglTimeEntry[]> => {
  const { promiseThrottle, throttledFn } = buildThrottler(
    apiFetchTogglTimeEntries,
  );

  const timeEntriesForPage: TogglTimeEntry[][] = [];
  let currentPage = totalPages;

  // We already got the first page, don't want to fetch again:
  while (currentPage > 1) {
    await promiseThrottle
      .add(
        // @ts-ignore
        throttledFn.bind(this, email, workspaceId, year, currentPage),
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

  dispatch(togglTimeEntriesFetchStarted());
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
    return dispatch(togglTimeEntriesFetchSuccess(allTimeEntries));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTimeEntriesFetchFailure());
  }
};
