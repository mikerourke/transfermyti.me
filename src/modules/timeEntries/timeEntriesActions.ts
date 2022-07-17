import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, TimeEntry } from "~/typeDefs";

export const createTimeEntries = createAsyncAction(
  "@timeEntries/createTimeEntriesRequest",
  "@timeEntries/createTimeEntriesSuccess",
  "@timeEntries/createTimeEntriesFailure",
)<undefined, Record<Mapping, Dictionary<TimeEntry>>, undefined>();

export const deleteTimeEntries = createAsyncAction(
  "@timeEntries/deleteTimeEntriesRequest",
  "@timeEntries/deleteTimeEntriesSuccess",
  "@timeEntries/deleteTimeEntriesFailure",
)<undefined, undefined, undefined>();

export const fetchTimeEntries = createAsyncAction(
  "@timeEntries/fetchTimeEntriesRequest",
  "@timeEntries/fetchTimeEntriesSuccess",
  "@timeEntries/fetchTimeEntriesFailure",
)<undefined, Record<Mapping, Dictionary<TimeEntry>>, undefined>();

export const isTimeEntryIncludedToggled = createAction(
  "@timeEntries/isTimeEntryIncludedToggled",
)<string>();

export const isDuplicateCheckEnabledToggled = createAction(
  "@timeEntries/isDuplicateCheckEnabledToggled",
)<undefined>();

export const areAllTimeEntriesIncludedUpdated = createAction(
  "@timeEntries/areAllTimeEntriesIncludedUpdated",
)<boolean>();
