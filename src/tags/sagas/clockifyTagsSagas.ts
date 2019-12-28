import { call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import {
  createEntitiesForTool,
  fetchEntitiesForTool,
  fetchObject,
  paginatedClockifyFetch,
} from "~/redux/sagaUtils";
import { EntityGroup, ToolName } from "~/entities/entitiesTypes";
import { TagModel } from "~/tags/tagsTypes";

export interface ClockifyTagResponseModel {
  id: string;
  name: string;
  workspaceId: string;
}

/**
 * Creates new Clockify tags in all target workspaces and returns array of
 * transformed tags.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tags-post
 */
export function* createClockifyTagsSaga(sourceTags: TagModel[]): SagaIterator {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTags,
    apiCreateFunc: createClockifyTag,
  });
}

/**
 * Fetches all tags in Clockify workspaces and returns array of transformed
 * tags.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tags-get
 */
export function* fetchClockifyTagsSaga(): SagaIterator<TagModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyTagsInWorkspace,
  });
}

function* createClockifyTag(
  sourceTag: TagModel,
  targetWorkspaceId: string,
): SagaIterator<TagModel> {
  const tagRequest = { name: sourceTag.name };
  const clockifyTag = yield call(
    fetchObject,
    `/clockify/api/v1/workspaces/${targetWorkspaceId}/tags`,
    { method: "POST", body: tagRequest },
  );

  return transformFromResponse(clockifyTag);
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
