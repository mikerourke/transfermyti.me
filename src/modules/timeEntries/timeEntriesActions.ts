import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, TimeEntry } from "~/typeDefs";

export const createTimeEntries = createAsyncAction(
  "@timeEntries/CREATE_TIME_ENTRIES_REQUEST",
  "@timeEntries/CREATE_TIME_ENTRIES_SUCCESS",
  "@timeEntries/CREATE_TIME_ENTRIES_FAILURE",
)<void, Record<Mapping, Dictionary<TimeEntry>>, void>();

export const deleteTimeEntries = createAsyncAction(
  "@timeEntries/DELETE_TIME_ENTRIES_REQUEST",
  "@timeEntries/DELETE_TIME_ENTRIES_SUCCESS",
  "@timeEntries/DELETE_TIME_ENTRIES_FAILURE",
)<void, void, void>();

export const fetchTimeEntries = createAsyncAction(
  "@timeEntries/FETCH_TIME_ENTRIES_REQUEST",
  "@timeEntries/FETCH_TIME_ENTRIES_SUCCESS",
  "@timeEntries/FETCH_TIME_ENTRIES_FAILURE",
)<void, Record<Mapping, Dictionary<TimeEntry>>, void>();

export const flipIsTimeEntryIncluded = createAction(
  "@timeEntries/FLIP_IS_INCLUDED",
)<string>();

export const flipIsDuplicateCheckEnabled = createAction(
  "@timeEntries/FLIP_IS_DUPLICATE_CHECK_ENABLED",
)();

export const updateAreAllTimeEntriesIncluded = createAction(
  "@timeEntries/UPDATE_ARE_ALL_INCLUDED",
)<boolean>();
