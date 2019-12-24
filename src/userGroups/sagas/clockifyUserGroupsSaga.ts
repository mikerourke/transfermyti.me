import { call, put, select, delay } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import {
  incrementTransferCounts,
  paginatedClockifyFetch,
  startGroupTransfer,
} from "~/redux/sagaUtils";
import { fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import {
  createClockifyUserGroups,
  fetchClockifyUserGroups,
} from "~/userGroups/userGroupsActions";
import { selectTargetUserGroupsForTransfer } from "~/userGroups/userGroupsSelectors";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
import { UserGroupModel } from "~/userGroups/userGroupsTypes";

interface ClockifyUserGroupResponseModel {
  id: string;
  name: string;
  userIds: string[];
}

interface ClockifyUserGroupRequestModel {
  name: string;
}

export function* createClockifyUserGroupsSaga(
  action: ActionType<typeof createClockifyUserGroups.request>,
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
      yield call(createClockifyUserGroup, workspaceId, userGroup);
      yield delay(500);
    }

    yield put(createClockifyUserGroups.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createClockifyUserGroups.failure());
  }
}

/**
 * Fetches all user groups in Clockify workspace and updates state with result.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--userGroups-get
 */
export function* fetchClockifyUserGroupsSaga(
  action: ActionType<typeof fetchClockifyUserGroups.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const clockifyUserGroups: ClockifyUserGroupResponseModel[] = yield call(
      paginatedClockifyFetch,
      `/clockify/api/workspaces/${workspaceId}/userGroups/`,
    );

    const recordsById: Record<string, UserGroupModel> = {};

    for (const clockifyUserGroup of clockifyUserGroups) {
      recordsById[clockifyUserGroup.id] = transformFromResponse(
        clockifyUserGroup,
        workspaceId,
      );
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Clockify);

    yield put(fetchClockifyUserGroups.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClockifyUserGroups.failure());
  }
}

/**
 * Creates a Clockify user group and returns the response as { [New UserGroup] }.
 * @see https://clockify.github.io/clockify_api_docs/#operation--workspaces--workspaceId--userGroups--post
 */
function* createClockifyUserGroup(
  workspaceId: string,
  userGroup: UserGroupModel,
): SagaIterator {
  const userGroupRequest = transformToRequest(userGroup);
  yield call(
    fetchObject,
    `/clockify/api/workspaces/${workspaceId}/userGroups`,
    {
      method: HttpMethod.Post,
      body: userGroupRequest,
    },
  );
}

function transformToRequest(
  userGroup: UserGroupModel,
): ClockifyUserGroupRequestModel {
  return {
    name: userGroup.name,
  };
}

function transformFromResponse(
  userGroup: ClockifyUserGroupResponseModel,
  workspaceId: string,
): UserGroupModel {
  return {
    id: userGroup.id,
    name: userGroup.name,
    userIds: userGroup.userIds,
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.UserGroups,
  };
}
