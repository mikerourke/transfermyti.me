import { createAction } from 'redux-actions';
import flatten from 'lodash/flatten';
import PromiseThrottle from 'promise-throttle';
import {
  apiFetchClockifyTimeEntries,
  apiFetchTogglTimeEntries,
} from '../api/timeEntries';
import { showFetchErrorNotification } from '../../app/appActions';
import {
  selectClockifyUserId,
  selectTogglUserEmail,
} from '../user/userSelectors';
import {
  ClockifyTimeEntry,
  TogglTimeEntry,
} from '../../../types/timeEntriesTypes';
import { Dispatch, GetState } from '../../rootReducer';

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

export const fetchClockifyTimeEntries = (
  workspaceId: string,
  year: number,
) => async (dispatch: Dispatch<any>, getState: GetState) => {
  dispatch(clockifyTimeEntriesFetchStarted());
  const userId = selectClockifyUserId(getState());
  try {
    const timeEntries = await apiFetchClockifyTimeEntries(
      userId,
      workspaceId,
      year,
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
  const fetchEntriesForPage = (page: number) =>
    new Promise((resolve, reject) =>
      apiFetchTogglTimeEntries(email, workspaceId, year, page)
        .then(({ data }) => {
          resolve(data);
        })
        .catch(error => {
          reject(error);
        }),
    );

  const promiseThrottle = new PromiseThrottle({
    requestsPerSecond: 4,
    promiseImplementation: Promise,
  });

  const timeEntriesForPage: TogglTimeEntry[][] = [];
  let requestsRemaining = totalPages;

  // We already got the first page, don't want to fetch again:
  while (requestsRemaining > 1) {
    await promiseThrottle
      .add(
        // @ts-ignore
        fetchEntriesForPage.bind(this, requestsRemaining),
      )
      .then((data: TogglTimeEntry[]) => {
        timeEntriesForPage.push(data);
      });
    requestsRemaining -= 1;
  }

  return flatten(timeEntriesForPage);
};

export const fetchTogglTimeEntries = (
  workspaceId: string,
  year: number,
) => async (dispatch: Dispatch<any>, getState: GetState) => {
  dispatch(togglTimeEntriesFetchStarted());
  const email = selectTogglUserEmail(getState());

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
