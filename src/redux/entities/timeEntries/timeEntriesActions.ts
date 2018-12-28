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
import { Dispatch, GetState } from '../../rootReducer';

export const clockifyTimeEntriesFetchStarted = createAction(
  '@timeEntries/CLOCKIFY_FETCH_STARTED',
);
export const clockifyTimeEntriesFetchSuccess = createAction(
  '@timeEntries/CLOCKIFY_FETCH_SUCCESS',
);
export const clockifyTimeEntriesFetchFailure = createAction(
  '@timeEntries/CLOCKIFY_FETCH_FAILURE',
);
export const togglTimeEntriesFetchStarted = createAction(
  '@timeEntries/TOGGL_FETCH_STARTED',
);
export const togglTimeEntriesFetchSuccess = createAction(
  '@timeEntries/TOGGL_FETCH_SUCCESS',
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
    const response = await apiFetchClockifyTimeEntries(
      userId,
      workspaceId,
      year,
    );
    return dispatch(clockifyTimeEntriesFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyTimeEntriesFetchFailure());
  }
};

export const fetchTogglTimeEntries = (
  workspaceId: string,
  year: number,
) => async (dispatch: Dispatch<any>, getState: GetState) => {
  dispatch(togglTimeEntriesFetchStarted());
  const email = selectTogglUserEmail(getState());

  try {
    const allTimeEntries = [];

    const fetchEntriesForPage = (page: number) =>
      apiFetchTogglTimeEntries(email, workspaceId, year, page).then(
        ({ data }) => {
          allTimeEntries.push(data);
        },
      );

    const firstPage = await apiFetchTogglTimeEntries(
      email,
      workspaceId,
      year,
      1,
    );

    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 1,
      promiseImplementation: Promise,
    });

    const { total_count, per_page, data } = firstPage;
    allTimeEntries.push(data);

    let requestsRemaining = Math.ceil(total_count / per_page);

    while (requestsRemaining > 0) {
      // @ts-ignore
      promiseThrottle.add(fetchEntriesForPage.bind(this, requestsRemaining));
      requestsRemaining -= 1;
    }

    const flattenedEntries = flatten(allTimeEntries);
    return dispatch(togglTimeEntriesFetchSuccess(flattenedEntries));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglTimeEntriesFetchFailure());
  }
};
