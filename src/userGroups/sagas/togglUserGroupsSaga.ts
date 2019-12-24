import { call, put, select, delay } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import {
  createTogglUserGroups,
  fetchTogglUserGroups,
} from "~/userGroups/userGroupsActions";
import { selectTargetUserGroupsForTransfer } from "~/userGroups/userGroupsSelectors";
import { UserGroupModel } from "~/userGroups/userGroupsTypes";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";

interface TogglUserGroupResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

interface TogglUserGroupRequestModel {
  name: string;
  wid: number;
}

export function* createTogglUserGroupsSaga(
  action: ActionType<typeof createTogglUserGroups.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const userGroups: UserGroupModel[] = yield select(
      selectTargetUserGroupsForTransfer,
      workspaceId,
    );
    yield call(startGroupTransfer, EntityGroup.UserGroups, userGroups.length);

    for (const userGroup of userGroups) {
      yield call(incrementTransferCounts);
      yield call(createTogglUserGroup, userGroup);
      yield delay(500);
    }

    yield put(createTogglUserGroups.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTogglUserGroups.failure());
  }
}

/**
 * Fetches all user groups in Toggl workspace and updates state with result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-groups
 */
export function* fetchTogglUserGroupsSaga(
  action: ActionType<typeof fetchTogglUserGroups.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const togglUserGroups: TogglUserGroupResponseModel[] = yield call(
      fetchArray,
      `/toggl/api/workspaces/${workspaceId}/groups`,
    );

    const recordsById: Record<string, UserGroupModel> = {};

    for (const togglUserGroup of togglUserGroups) {
      const userGroupId = togglUserGroup.id.toString();
      recordsById[userGroupId] = transformFromResponse(
        togglUserGroup,
        workspaceId,
      );
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Toggl);

    yield put(fetchTogglUserGroups.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTogglUserGroups.failure());
  }
}

/**
 * Creates a Toggl user group and returns the response as
 * { data: [New User Group] }.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/groups.md#create-a-group
 */
function* createTogglUserGroup(userGroup: UserGroupModel): SagaIterator {
  const userGroupRequest = transformToRequest(userGroup);
  yield call(fetchObject, `/toggl/api/groups`, {
    method: HttpMethod.Post,
    body: userGroupRequest,
  });
}

function transformToRequest(
  userGroup: UserGroupModel,
): TogglUserGroupRequestModel {
  return {
    name: userGroup.name,
    wid: +userGroup.workspaceId,
  };
}

function transformFromResponse(
  userGroup: TogglUserGroupResponseModel,
  workspaceId: string,
): UserGroupModel {
  return {
    id: userGroup.id.toString(),
    name: userGroup.name,
    userIds: [],
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.UserGroups,
  };
}
