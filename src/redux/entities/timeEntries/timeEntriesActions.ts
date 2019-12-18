import { createAsyncAction, createAction } from "typesafe-actions";
import { flatten, isNil } from "lodash";
import { pause } from "~/utils/pause";
import {
  batchClockifyTransferRequests,
  buildThrottler,
  getValidEntities,
} from "~/redux/utils";
import {
  apiCreateClockifyTimeEntry,
  apiFetchClockifyTimeEntries,
  apiFetchTogglTimeEntries,
} from "~/redux/entities/api/timeEntries";
import { showFetchErrorNotification } from "~/redux/app/appActions";
import { selectCurrentTransferType } from "~/redux/app/appSelectors";
import { selectCredentials } from "~/redux/credentials/credentialsSelectors";
import { selectEntitiesByGroupFactory } from "~/redux/entities/entitiesSelectors";
import { calculateUserGroupEntryCounts } from "~/redux/entities/userGroups/userGroupsActions";
import {
  selectClockifyUsersById,
  selectTogglUsersById,
} from "~/redux/entities/users/usersSelectors";
import { updateIsWorkspaceYearIncluded } from "~/redux/entities/workspaces/workspacesActions";
import { selectTogglWorkspaceIncludedYears } from "~/redux/entities/workspaces/workspacesSelectors";
import { TimeEntryTransform } from "./TimeEntryTransform";
import { TimeEntriesState } from "./timeEntriesReducer";
import { selectTimeEntriesForWorkspace } from "./timeEntriesSelectors";
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
} from "~/types";

type TimeEntryForTool = ClockifyTimeEntryModel | TogglTimeEntryModel;

export const clockifyTimeEntriesFetch = createAsyncAction(
  "@timeEntries/CLOCKIFY_FETCH_REQUEST",
  "@timeEntries/CLOCKIFY_FETCH_SUCCESS",
  "@timeEntries/CLOCKIFY_FETCH_FAILURE",
)<void, Array<CompoundTimeEntryModel>, void>();

export const togglTimeEntriesFetch = createAsyncAction(
  "@timeEntries/TOGGL_FETCH_REQUEST",
  "@timeEntries/TOGGL_FETCH_SUCCESS",
  "@timeEntries/TOGGL_FETCH_FAILURE",
)<void, Array<CompoundTimeEntryModel>, void>();

export const clockifyTimeEntriesTransfer = createAsyncAction(
  "@timeEntries/CLOCKIFY_TRANSFER_REQUEST",
  "@timeEntries/CLOCKIFY_TRANSFER_SUCCESS",
  "@timeEntries/CLOCKIFY_TRANSFER_FAILURE",
)<void, Array<CompoundTimeEntryModel>, void>();

export const flipIsTimeEntryIncluded = createAction(
  "@timeEntries/FLIP_IS_INCLUDED",
)<string>();

export const addLinksToTimeEntries = createAction(
  "@timeEntries/ADD_LINKS_TO_TIME_ENTRIES",
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

    dispatch(clockifyTimeEntriesFetch.success(timeEntries));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyTimeEntriesFetch.failure());
  }
};

export const fetchTogglTimeEntries = (workspaceId: string) => async (
  dispatch: ReduxDispatch,
  getState: ReduxGetState,
) => {
  dispatch(togglTimeEntriesFetch.request());

  try {
    const state = getState();
    const { togglEmail, togglUserId } = selectCredentials(state);
    const currentTransferType = selectCurrentTransferType(state);

    const allTimeEntries = [];
    const currentYear = new Date().getFullYear();

    for (let year = 2007; year <= currentYear; year += 1) {
      // Ensure the rate limit doesn't get exceeded (1 request per second):
      await pause(1_000);
      const timeEntriesForYear = await fetchTogglTimeEntriesForYear({
        togglEmail,
        workspaceId,
        year,
      });

      if (timeEntriesForYear.length !== 0) {
        allTimeEntries.push(timeEntriesForYear);
      }
    }

    const usersById = selectTogglUsersById(state);
    const compoundTimeEntries = convertToCompoundTimeEntries({
      workspaceId,
      timeEntries: flatten(allTimeEntries),
      entitiesByGroup: selectEntitiesByGroupFactory(ToolName.Toggl)(state),
    });

    const timeEntries =
      currentTransferType === TransferType.SingleUser
        ? compoundTimeEntries.filter(({ userId }) => userId === togglUserId)
        : compoundTimeEntries;

    for (let year = 2007; year <= currentYear; year += 1) {
      const entryInYear = timeEntries.find(
        timeEntry => +timeEntry.year === +year,
      );
      if (!isNil(entryInYear)) {
        dispatch(
          updateIsWorkspaceYearIncluded({
            workspaceId,
            year,
            isIncluded: true,
          }),
        );
      }
    }

    dispatch(
      calculateUserGroupEntryCounts({
        toolName: ToolName.Toggl,
        timeEntries,
        usersById,
      }),
    );

    dispatch(togglTimeEntriesFetch.success(timeEntries));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(togglTimeEntriesFetch.failure());
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
  if (timeEntriesInWorkspace.length === 0) {
    return;
  }

  dispatch(clockifyTimeEntriesTransfer.request());

  try {
    const clockifyTimeEntries = await batchClockifyTransferRequests({
      requestsPerSecond: 10,
      dispatch,
      entityGroup: EntityGroup.TimeEntries,
      entityRecordsInWorkspace: timeEntriesInWorkspace,
      apiFunc: apiCreateClockifyTimeEntry,
      clockifyWorkspaceId,
      togglWorkspaceId,
    });

    const timeEntries = convertToCompoundTimeEntries({
      workspaceId: clockifyWorkspaceId,
      timeEntries: clockifyTimeEntries,
      entitiesByGroup: selectEntitiesByGroupFactory(ToolName.Clockify)(state),
    });

    dispatch(clockifyTimeEntriesTransfer.success(timeEntries));
  } catch (err) {
    dispatch(showFetchErrorNotification(err));
    dispatch(clockifyTimeEntriesTransfer.failure());
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

async function fetchTogglTimeEntriesForYear({
  togglEmail,
  workspaceId,
  year,
}: {
  togglEmail: string;
  workspaceId: string;
  year: number;
}): Promise<Array<TogglTimeEntryModel>> {
  const {
    total_count: totalCount,
    per_page: perPage,
    data: firstPageEntries,
  } = await apiFetchTogglTimeEntries(togglEmail, workspaceId, year, 1);

  if (totalCount === 0) {
    return [];
  }

  if (totalCount <= perPage) {
    return firstPageEntries;
  }

  await pause(1_000);
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
  const timeEntriesForPage: Array<Array<TogglTimeEntryModel>> = [];

  // We already got the first page, don't want to fetch again:
  for (let currentPage = 2; currentPage <= totalPages; currentPage += 1) {
    const { data } = await apiFetchTogglTimeEntries(
      email,
      workspaceId,
      year,
      currentPage,
    );
    timeEntriesForPage.push(data);
    await pause(1_000);
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
  if (getValidEntities(timeEntries).length === 0) {
    return [];
  }

  return timeEntries.map(timeEntry => {
    const transform = new TimeEntryTransform(timeEntry);
    return transform.compound(workspaceId, entitiesByGroup);
  });
}
