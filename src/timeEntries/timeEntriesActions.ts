import { createAction, createAsyncAction } from "typesafe-actions";
import { Mapping } from "~/allEntities/allEntitiesTypes";
import { TimeEntriesByIdModel } from "./timeEntriesTypes";

export const createTimeEntries = createAsyncAction(
  "@timeEntries/CREATE_TIME_ENTRIES_REQUEST",
  "@timeEntries/CREATE_TIME_ENTRIES_SUCCESS",
  "@timeEntries/CREATE_TIME_ENTRIES_FAILURE",
)<void, Record<Mapping, TimeEntriesByIdModel>, void>();

export const fetchTimeEntries = createAsyncAction(
  "@timeEntries/FETCH_TIME_ENTRIES_REQUEST",
  "@timeEntries/FETCH_TIME_ENTRIES_SUCCESS",
  "@timeEntries/FETCH_TIME_ENTRIES_FAILURE",
)<void, Record<Mapping, TimeEntriesByIdModel>, void>();

export const flipIsTimeEntryIncluded = createAction(
  "@timeEntries/FLIP_IS_INCLUDED",
)<string>();

export const addLinksToTimeEntries = createAction(
  "@timeEntries/ADD_LINKS_TO_TIME_ENTRIES",
)<Record<Mapping, TimeEntriesByIdModel>>();
