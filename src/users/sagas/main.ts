import { all, takeEvery } from "redux-saga/effects";
import {
  createClockifyUsers,
  createTogglUsers,
  fetchClockifyUsers,
  fetchTogglUsers,
} from "~/users/usersActions";
import {
  createClockifyUsersSaga,
  fetchClockifyUsersSaga,
} from "./clockifyUsersSaga";
import { createTogglUsersSaga, fetchTogglUsersSaga } from "./togglUsersSaga";

export function* usersSaga(): Generator {
  yield all([
    takeEvery(createClockifyUsers.request, createClockifyUsersSaga),
    takeEvery(createTogglUsers.request, createTogglUsersSaga),
    takeEvery(fetchClockifyUsers.request, fetchClockifyUsersSaga),
    takeEvery(fetchTogglUsers.request, fetchTogglUsersSaga),
  ]);
}
