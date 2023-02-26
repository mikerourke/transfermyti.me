import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { fetchArray, fetchObject } from "~/api/apiRequests";
import { createEntitiesForTool } from "~/api/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/api/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/api/fetchEntitiesForTool";
import { EntityGroup, ToolName, type Tag } from "~/typeDefs";
import { validStringify } from "~/utilities/textTransforms";

/**
 * Response from Toggl API for tags.
 * @see https://developers.track.toggl.com/docs/api/tags#response
 */
interface TogglTagResponse {
  id: number;
  workspace_id: number;
  name: string;
  at: string;
}

/**
 * Creates new Toggl tags that correspond to source and returns array of
 * transformed tags.
 */
export function* createTogglTagsSaga(sourceTags: Tag[]): SagaIterator<Tag[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTags,
    apiCreateFunc: createTogglTag,
  });
}

/**
 * Deletes all specified source tags from Toggl.
 */
export function* deleteTogglTagsSaga(sourceTags: Tag[]): SagaIterator {
  yield call(deleteEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTags,
    apiDeleteFunc: deleteTogglTag,
  });
}

/**
 * Fetches all tags in Toggl workspaces and returns array of transformed tags.
 */
export function* fetchTogglTagsSaga(): SagaIterator<Tag[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglTagsInWorkspace,
  });
}

/**
 * Creates a new Toggl tag.
 * @see https://developers.track.toggl.com/docs/api/tags#post-create-tag
 */
function* createTogglTag(
  sourceTag: Tag,
  targetWorkspaceId: string,
): SagaIterator<Tag> {
  const body = {
    name: sourceTag.name,
    workspace_id: +targetWorkspaceId,
  };

  const togglTag = yield call(
    fetchObject,
    `/toggl/api/workspaces/${targetWorkspaceId}/tags`,
    {
      method: "POST",
      body,
    },
  );

  return transformFromResponse(togglTag);
}

/**
 * Deletes the specified Toggl tag.
 * @see https://developers.track.toggl.com/docs/api/tags#delete-delete-tag
 */
function* deleteTogglTag(sourceTag: Tag): SagaIterator {
  const { id, workspaceId } = sourceTag;

  yield call(fetchObject, `/toggl/api/workspaces/${workspaceId}/tags/${id}`, {
    method: "DELETE",
  });
}

/**
 * Fetches Toggl tags in the specified workspace.
 * @see https://developers.track.toggl.com/docs/api/tags#get-tags
 */
function* fetchTogglTagsInWorkspace(workspaceId: string): SagaIterator<Tag[]> {
  const togglTags: TogglTagResponse[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/tags`,
  );

  return togglTags.map(transformFromResponse);
}

function transformFromResponse(tag: TogglTagResponse): Tag {
  return {
    id: tag.id.toString(),
    name: tag.name,
    workspaceId: validStringify(tag?.workspace_id, ""),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tags,
  };
}
