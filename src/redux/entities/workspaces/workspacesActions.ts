import { createAction } from 'redux-actions';
import PromiseThrottle from 'promise-throttle';
import set from 'lodash/set';
import {
  apiFetchClockifyWorkspaces,
  apiFetchTogglWorkspaces,
  apiFetchTogglWorkspaceSummaryForYear,
} from '../api/workspaces';
import { showFetchErrorNotification } from '../../app/appActions';
import { selectTogglUserEmail } from '../user/userSelectors';
import {
  ClockifyWorkspace,
  TogglWorkspace,
} from '../../../types/workspacesTypes';
import { Dispatch, GetState } from '../../rootReducer';

export const clockifyWorkspacesFetchStarted = createAction(
  '@workspaces/CLOCKIFY_FETCH_STARTED',
);
export const clockifyWorkspacesFetchSuccess = createAction(
  '@workspaces/CLOCKIFY_FETCH_SUCCESS',
  (response: ClockifyWorkspace[]) => response,
);
export const clockifyWorkspacesFetchFailure = createAction(
  '@workspaces/CLOCKIFY_FETCH_FAILURE',
);
export const togglWorkspacesFetchStarted = createAction(
  '@workspaces/TOGGL_FETCH_STARTED',
);
export const togglWorkspacesFetchSuccess = createAction(
  '@workspaces/TOGGL_FETCH_SUCCESS',
  (response: TogglWorkspace[]) => response,
);
export const togglWorkspacesFetchFailure = createAction(
  '@workspaces/TOGGL_FETCH_FAILURE',
);
export const togglWorkspaceSummaryFetchStarted = createAction(
  '@workspaces/TOGGL_SUMMARY_FETCH_STARTED',
);
export const togglWorkspaceSummaryFetchSuccess = createAction(
  '@workspaces/TOGGL_SUMMARY_FETCH_SUCCESS',
  (workspaceId: string, inclusionsByYear: Record<string, boolean>) => ({
    workspaceId,
    inclusionsByYear,
  }),
);
export const togglWorkspaceSummaryFetchFailure = createAction(
  '@workspaces/TOGGL_SUMMARY_FETCH_FAILURE',
);
export const updateIsWorkspaceIncluded = createAction(
  '@workspaces/UPDATE_IS_INCLUDED',
  (workspaceId: string) => workspaceId,
);
export const updateIsWorkspaceYearIncluded = createAction(
  '@workspaces/UPDATE_IS_YEAR_INCLUDED',
  (workspaceId: string, year: string) => ({ workspaceId, year }),
);

export const fetchClockifyWorkspaces = () => async (
  dispatch: Dispatch<any>,
) => {
  dispatch(clockifyWorkspacesFetchStarted());
  try {
    const response = await apiFetchClockifyWorkspaces();
    return dispatch(clockifyWorkspacesFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(clockifyWorkspacesFetchFailure());
  }
};

export const fetchTogglWorkspaces = () => async (dispatch: Dispatch<any>) => {
  dispatch(togglWorkspacesFetchStarted());
  try {
    const response = await apiFetchTogglWorkspaces();
    return dispatch(togglWorkspacesFetchSuccess(response));
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglWorkspacesFetchFailure());
  }
};

export const fetchTogglWorkspaceSummary = (workspaceId: string) => async (
  dispatch: Dispatch<any>,
  getState: GetState,
) => {
  dispatch(togglWorkspaceSummaryFetchStarted());
  try {
    const email = selectTogglUserEmail(getState());

    const fetchSummaryForYear = (workspaceId: string, year: number) =>
      new Promise((resolve, reject) =>
        apiFetchTogglWorkspaceSummaryForYear(email, workspaceId, year)
          .then(({ data }) => {
            const entryCount = data.reduce(
              (acc, { items }) => acc + items.length,
              0,
            );
            resolve(entryCount);
          })
          .catch(error => reject(error)),
      );

    const promiseThrottle = new PromiseThrottle({
      requestsPerSecond: 3,
      promiseImplementation: Promise,
    });

    const inclusionsByYear = {};
    let yearToFetch = new Date().getFullYear();
    while (yearToFetch > 2007) {
      await promiseThrottle
        .add(
          // @ts-ignore
          fetchSummaryForYear.bind(this, workspaceId, yearToFetch),
        )
        .then((entryCount: number) => {
          if (entryCount > 0) set(inclusionsByYear, yearToFetch, true);
        });
      yearToFetch -= 1;
    }

    return dispatch(
      togglWorkspaceSummaryFetchSuccess(workspaceId, inclusionsByYear),
    );
  } catch (error) {
    dispatch(showFetchErrorNotification(error));
    return dispatch(togglWorkspaceSummaryFetchFailure());
  }
};
