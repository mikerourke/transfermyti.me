import { all, takeEvery } from "redux-saga/effects";
import {
  createClockifyUserGroups,
  createTogglUserGroups,
  fetchClockifyUserGroups,
  fetchTogglUserGroups,
} from "~/userGroups/userGroupsActions";
import {
  createClockifyUserGroupsSaga,
  fetchClockifyUserGroupsSaga,
} from "./clockifyUserGroupsSaga";
import {
  createTogglUserGroupsSaga,
  fetchTogglUserGroupsSaga,
} from "./togglUserGroupsSaga";

export function* userGroupsSaga(): Generator {
  yield all([
    takeEvery(createClockifyUserGroups.request, createClockifyUserGroupsSaga),
    takeEvery(createTogglUserGroups.request, createTogglUserGroupsSaga),
    takeEvery(fetchClockifyUserGroups.request, fetchClockifyUserGroupsSaga),
    takeEvery(fetchTogglUserGroups.request, fetchTogglUserGroupsSaga),
  ]);
}
