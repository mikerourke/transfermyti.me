import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import {
  fetchObject,
  fetchPaginatedFromClockify,
} from "~/entityOperations/apiRequests";
import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { EntityGroup, TagModel, ToolName } from "~/typeDefs";

export interface ClockifyTagResponseModel {
  id: string;
  name: string;
  workspaceId: string;
}

/**
 * Creates new Clockify tags in all target workspaces and returns array of
 * transformed tags.
 */
export function* createClockifyTagsSaga(sourceTags: TagModel[]): SagaIterator {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTags,
    apiCreateFunc: createClockifyTag,
  });
}

/**
 * Deletes all specified source tags from Clockify.
 */
export function* deleteClockifyTagsSaga(sourceTags: TagModel[]): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Clockify,
    sourceRecords: sourceTags,
    apiDeleteFunc: deleteClockifyTag,
  });
}

/**
 * Fetches all tags in Clockify workspaces and returns array of transformed
 * tags.
 */
export function* fetchClockifyTagsSaga(): SagaIterator<TagModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Clockify,
    apiFetchFunc: fetchClockifyTagsInWorkspace,
  });
}

/**
 * Creates a new Clockify tag.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tags-post
 */
function* createClockifyTag(
  sourceTag: TagModel,
  targetWorkspaceId: string,
): SagaIterator<TagModel> {
  const tagRequest = { name: sourceTag.name };
  const clockifyTag = yield call(
    fetchObject,
    `/clockify/api/workspaces/${targetWorkspaceId}/tags`,
    { method: "POST", body: tagRequest },
  );

  return transformFromResponse(clockifyTag);
}

/**
 * Deletes the specified Clockify tag.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tags--tagId--delete
 */
function* deleteClockifyTag(sourceTag: TagModel): SagaIterator {
  const { workspaceId, id } = sourceTag;
  yield call(
    fetchObject,
    `/clockify/api/workspaces/${workspaceId}/tags/${id}`,
    { method: "DELETE" },
  );
}

/**
 * Fetches Clockify tags in specified workspace.
 * @see https://clockify.me/developers-api#operation--v1-workspaces--workspaceId--tags-get
 */
function* fetchClockifyTagsInWorkspace(
  workspaceId: string,
): SagaIterator<TagModel[]> {
  const clockifyTags: ClockifyTagResponseModel[] = yield call(
    fetchPaginatedFromClockify,
    `/clockify/api/workspaces/${workspaceId}/tags`,
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
