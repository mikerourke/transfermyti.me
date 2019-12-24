import { all, takeEvery } from "redux-saga/effects";
import {
  createClockifyClients,
  createTogglClients,
  fetchClockifyClients,
  fetchTogglClients,
} from "~/clients/clientsActions";
import {
  createClockifyClientsSaga,
  fetchClockifyClientsSaga,
} from "./clockifyClientsSaga";
import {
  createTogglClientsSaga,
  fetchTogglClientsSaga,
} from "./togglClientsSaga";

export function* clientsSaga(): Generator {
  yield all([
    takeEvery(createClockifyClients.request, createClockifyClientsSaga),
    takeEvery(fetchClockifyClients.request, fetchClockifyClientsSaga),
    takeEvery(createTogglClients.request, createTogglClientsSaga),
    takeEvery(fetchTogglClients.request, fetchTogglClientsSaga),
  ]);
}
