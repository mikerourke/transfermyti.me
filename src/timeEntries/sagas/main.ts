import { all, takeEvery } from "redux-saga/effects";
import {
  createClockifyTimeEntries,
  createTogglTimeEntries,
  fetchClockifyTimeEntries,
  fetchTogglTimeEntries,
} from "~/timeEntries/timeEntriesActions";
import {
  createClockifyTimeEntriesSaga,
  fetchClockifyTimeEntriesSaga,
} from "./clockifyTimeEntriesSaga";
import {
  createTogglTimeEntriesSaga,
  fetchTogglTimeEntriesSaga,
} from "./togglTimeEntriesSaga";

export function* timeEntriesSaga(): Generator {
  yield all([
    takeEvery(createClockifyTimeEntries.request, createClockifyTimeEntriesSaga),
    takeEvery(createTogglTimeEntries.request, createTogglTimeEntriesSaga),
    takeEvery(fetchClockifyTimeEntries.request, fetchClockifyTimeEntriesSaga),
    takeEvery(fetchTogglTimeEntries.request, fetchTogglTimeEntriesSaga),
  ]);
}
