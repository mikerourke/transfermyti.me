import { all, takeEvery } from "redux-saga/effects";
import {
  createClockifyTasks,
  createTogglTasks,
  fetchClockifyTasks,
  fetchTogglTasks,
} from "~/tasks/tasksActions";
import {
  createClockifyTasksSaga,
  fetchClockifyTasksSaga,
} from "./clockifyTasksSaga";
import { createTogglTasksSaga, fetchTogglTasksSaga } from "./togglTasksSaga";

export function* tasksSaga(): Generator {
  yield all([
    takeEvery(createClockifyTasks.request, createClockifyTasksSaga),
    takeEvery(createTogglTasks.request, createTogglTasksSaga),
    takeEvery(fetchClockifyTasks.request, fetchClockifyTasksSaga),
    takeEvery(fetchTogglTasks.request, fetchTogglTasksSaga),
  ]);
}
