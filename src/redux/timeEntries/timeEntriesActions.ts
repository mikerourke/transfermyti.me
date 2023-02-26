import { createAction, createAsyncAction } from "~/redux/reduxTools";
import type { Mapping, TimeEntry } from "~/typeDefs";

export const areAllTimeEntriesIncludedUpdated = createAction<boolean>(
  "@timeEntries/areAllTimeEntriesIncludedUpdated",
);

export const isDuplicateCheckEnabledToggled = createAction<undefined>(
  "@timeEntries/isDuplicateCheckEnabledToggled",
);

export const isTimeEntryIncludedToggled = createAction<string>(
  "@timeEntries/isTimeEntryIncludedToggled",
);

export const createTimeEntries = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<TimeEntry>>,
  undefined
>("@timeEntries/createTimeEntries");

export const deleteTimeEntries = createAsyncAction<
  undefined,
  undefined,
  undefined
>("@timeEntries/deleteTimeEntr");

export const fetchTimeEntries = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<TimeEntry>>,
  undefined
>("@timeEntries/fetchTimeEntries");
