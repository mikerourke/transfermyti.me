import { createAsyncAction, createAction } from "typesafe-actions";
import { TimeEntriesState } from "./timeEntriesReducer";
import { MappedEntityRecordsModel } from "~/common/commonTypes";
import { TimeEntryModel } from "./timeEntriesTypes";

export const createClockifyTimeEntries = createAsyncAction(
  "@timeEntries/CREATE_CLOCKIFY_TIME_ENTRIES_REQUEST",
  "@timeEntries/CREATE_CLOCKIFY_TIME_ENTRIES_SUCCESS",
  "@timeEntries/CREATE_CLOCKIFY_TIME_ENTRIES_FAILURE",
)<string, void, void>();

export const createTogglTimeEntries = createAsyncAction(
  "@timeEntries/CREATE_TOGGL_TIME_ENTRIES_REQUEST",
  "@timeEntries/CREATE_TOGGL_TIME_ENTRIES_SUCCESS",
  "@timeEntries/CREATE_TOGGL_TIME_ENTRIES_FAILURE",
)<string, void, void>();

export const fetchClockifyTimeEntries = createAsyncAction(
  "@timeEntries/FETCH_CLOCKIFY_TIME_ENTRIES_REQUEST",
  "@timeEntries/FETCH_CLOCKIFY_TIME_ENTRIES_SUCCESS",
  "@timeEntries/FETCH_CLOCKIFY_TIME_ENTRIES_FAILURE",
)<string, MappedEntityRecordsModel<TimeEntryModel>, void>();

export const fetchTogglTimeEntries = createAsyncAction(
  "@timeEntries/FETCH_TOGGL_TIME_ENTRIES_REQUEST",
  "@timeEntries/FETCH_TOGGL_TIME_ENTRIES_SUCCESS",
  "@timeEntries/FETCH_TOGGL_TIME_ENTRIES_FAILURE",
)<string, MappedEntityRecordsModel<TimeEntryModel>, void>();

export const flipIsTimeEntryIncluded = createAction(
  "@timeEntries/FLIP_IS_INCLUDED",
)<string>();

export const addLinksToTimeEntries = createAction(
  "@timeEntries/ADD_LINKS_TO_TIME_ENTRIES",
)<TimeEntriesState>();
