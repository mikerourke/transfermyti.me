import { call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { fetchObject } from "~/utils";
import {
  createEntitiesForTool,
  fetchEntitiesForTool,
  paginatedClockifyFetch,
} from "~/redux/sagaUtils";
import { EntityGroup, HttpMethod, ToolName } from "~/common/commonTypes";
import { TagModel } from "~/tags/tagsTypes";

export interface ClockifyTagResponseModel {
  id: string;
  name: string;
  workspaceId: string;
}

interface ClockifyTagRequestModel {
  name: string;
}

/**
 * Creates new Clockify tags in all target workspaces and returns an array of
 * transformed tags.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tags-post
 */
export function* createClockifyTagsSaga(sourceTags: TagModel[]): SagaIterator {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTags,
    creatorFunc: createClockifyTag,
  });
}

/**
 * Fetches all tags in Clockify workspaces and returns result.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tags-get
 */
export function* fetchClockifyTagsSaga(): SagaIterator<TagModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    fetchFunc: fetchClockifyTagsInWorkspace,
  });
}

function* createClockifyTag(
  sourceTag: TagModel,
  workspaceId: string,
): SagaIterator<TagModel | null> {
  const tagRequest = transformToRequest(sourceTag);
  const targetTag = yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${workspaceId}/tags`,
    { method: HttpMethod.Post, body: tagRequest },
  );

  return transformFromResponse(targetTag);
}

function* fetchClockifyTagsInWorkspace(
  workspaceId: string,
): SagaIterator<TagModel[]> {
  const clockifyTags: ClockifyTagResponseModel[] = yield call(
    paginatedClockifyFetch,
    `/clockify/api/v1/workspaces/${workspaceId}/tags`,
  );

  return clockifyTags.map(transformFromResponse);
}

function transformToRequest(tag: TagModel): ClockifyTagRequestModel {
  return {
    name: tag.name,
  };
}

function transformFromResponse(tag: ClockifyTagResponseModel): TagModel {
  return {
    id: tag.id,
    name: tag.name,
    workspaceId: tag.workspaceId,
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tags,
  };
}
