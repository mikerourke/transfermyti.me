import { call, put, select, delay } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { SagaIterator } from "@redux-saga/types";
import { incrementTransferCounts, startGroupTransfer } from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { showFetchErrorNotification } from "~/app/appActions";
import { selectToolMapping } from "~/app/appSelectors";
import { createTogglTags, fetchTogglTags } from "~/tags/tagsActions";
import { selectTargetTagsForTransfer } from "~/tags/tagsSelectors";
import { TagModel } from "~/tags/tagsTypes";
import {
  EntityGroup,
  HttpMethod,
  Mapping,
  ToolName,
} from "~/common/commonTypes";

interface TogglTagResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

interface TogglTagRequestModel {
  name: string;
  wid: number;
}

export function* createTogglTagsSaga(
  action: ActionType<typeof createTogglTags.request>,
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
      yield call(createTogglTag, tag);
      yield delay(500);
    }

    yield put(createTogglTags.success());
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(createTogglTags.failure());
  }
}

/**
 * Fetches all tags in Toggl workspace and updates state with result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-tags
 */
export function* fetchTogglTagsSaga(
  action: ActionType<typeof fetchTogglTags.request>,
): SagaIterator {
  const workspaceId = action.payload;

  try {
    const togglTags: TogglTagResponseModel[] = yield call(
      fetchArray,
      `/toggl/api/workspaces/${workspaceId}/tags`,
    );

    const recordsById: Record<string, TagModel> = {};

    for (const togglTag of togglTags) {
      const tagId = togglTag.id.toString();
      recordsById[tagId] = transformFromResponse(togglTag, workspaceId);
    }
    const mapping: Mapping = yield select(selectToolMapping, ToolName.Toggl);

    yield put(fetchTogglTags.success({ mapping, recordsById }));
  } catch (err) {
    yield put(showFetchErrorNotification(err));
    yield put(fetchTogglTags.failure());
  }
}

/**
 * Creates a Toggl tag and returns the response as { data: [New Tag] }.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tags.md#create-a-tag
 */
function* createTogglTag(tag: TagModel): SagaIterator {
  const tagRequest = transformToRequest(tag);
  yield call(fetchObject, `/toggl/api/tags`, {
    method: HttpMethod.Post,
    body: tagRequest,
  });
}

function transformToRequest(tag: TagModel): TogglTagRequestModel {
  return {
    name: tag.name,
    wid: +tag.workspaceId,
  };
}

function transformFromResponse(
  tag: TogglTagResponseModel,
  workspaceId: string,
): TagModel {
  return {
    id: tag.id.toString(),
    name: tag.name,
    workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tags,
  };
}
