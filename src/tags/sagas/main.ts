import { all, takeEvery } from "redux-saga/effects";
import {
  createClockifyTags,
  createTogglTags,
  fetchClockifyTags,
  fetchTogglTags,
} from "~/tags/tagsActions";
import {
  createClockifyTagsSaga,
  fetchClockifyTagsSaga,
} from "./clockifyTagsSaga";
import { createTogglTagsSaga, fetchTogglTagsSaga } from "./togglTagsSaga";

export function* tagsSaga(): Generator {
  yield all([
    takeEvery(createClockifyTags.request, createClockifyTagsSaga),
    takeEvery(createTogglTags.request, createTogglTagsSaga),
    takeEvery(fetchClockifyTags.request, fetchClockifyTagsSaga),
    takeEvery(fetchTogglTags.request, fetchTogglTagsSaga),
  ]);
}
