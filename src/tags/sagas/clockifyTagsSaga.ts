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
import { createClockifyTags, fetchClockifyTags } from "~/tags/tagsActions";
import { selectTargetTagsForTransfer } from "~/tags/tagsSelectors";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";
import { TagModel } from "~/tags/tagsTypes";

export interface ClockifyTagResponseModel {
  id: string;
  name: string;
  workspaceId: string;
}

interface ClockifyTagRequestModel {
  name: string;
}

export function* createClockifyTagsSaga(
  action: ActionType<typeof createClockifyTags.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const tags: TagModel[] = yield select(
      selectTargetTagsForTransfer,
      workspaceId,
    );
    yield call(startGroupTransfer, EntityGroup.Tags, tags.length);

    for (const tag of tags) {
      yield call(incrementTransferCounts);
      yield call(createClockifyTag, workspaceId, tag);
      yield delay(500);
    }

    yield put(createClockifyTags.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createClockifyTags.failure());
  }
}

/**
 * Fetches all tags in Clockify workspace and updates state with result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tags-get
 */
export function* fetchClockifyTagsSaga(
  action: ActionType<typeof fetchClockifyTags.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const clockifyTags: ClockifyTagResponseModel[] = yield call(
      paginatedClockifyFetch,
      `/clockify/api/v1/workspaces/${workspaceId}/tags`,
    );

    const recordsById: Record<string, TagModel> = {};

    for (const clockifyTag of clockifyTags) {
      recordsById[clockifyTag.id] = transformFromResponse(
        clockifyTag,
        workspaceId,
      );
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Clockify);

    yield put(fetchClockifyTags.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchClockifyTags.failure());
  }
}

/**
 * Creates a Clockify tag and returns the response as { [New Tag] }.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tags-post
 */
function* createClockifyTag(workspaceId: string, tag: TagModel): SagaIterator {
  const tagRequest = transformToRequest(tag);
  yield call(fetchObject, `/clockify/api/v1/workspaces/${workspaceId}/tags`, {
    method: HttpMethod.Post,
    body: tagRequest,
  });
}

function transformToRequest(tag: TagModel): ClockifyTagRequestModel {
  return {
    name: tag.name,
  };
}

function transformFromResponse(
  tag: ClockifyTagResponseModel,
  workspaceId: string,
): TagModel {
  return {
    id: tag.id,
    name: tag.name,
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tags,
  };
}
