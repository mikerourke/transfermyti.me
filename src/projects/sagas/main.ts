import { all, takeEvery } from "redux-saga/effects";
import {
  createClockifyProjects,
  createTogglProjects,
  fetchClockifyProjects,
  fetchTogglProjects,
} from "~/projects/projectsActions";
import {
  createClockifyProjectsSaga,
  fetchClockifyProjectsSaga,
} from "./clockifyProjectsSaga";
import {
  createTogglProjectsSaga,
  fetchTogglProjectsSaga,
} from "./togglProjectsSaga";

export function* projectsSaga(): Generator {
  yield all([
    takeEvery(createClockifyProjects.request, createClockifyProjectsSaga),
    takeEvery(fetchClockifyProjects.request, fetchClockifyProjectsSaga),
    takeEvery(createTogglProjects.request, createTogglProjectsSaga),
    takeEvery(fetchTogglProjects.request, fetchTogglProjectsSaga),
  ]);
}
