import type { SagaIterator } from "redux-saga";
import { call } from "redux-saga/effects";

import { fetchArray, fetchObject } from "~/entityOperations/apiRequests";
import { createEntitiesForTool } from "~/entityOperations/createEntitiesForTool";
import { deleteEntitiesForTool } from "~/entityOperations/deleteEntitiesForTool";
import { fetchEntitiesForTool } from "~/entityOperations/fetchEntitiesForTool";
import { EntityGroup, ToolName, type Tag } from "~/typeDefs";
import { validStringify } from "~/utilities/textTransforms";

interface TogglTagResponse {
  id: number;
  wid: number;
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
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tags.md#create-a-tag
 */
function* createTogglTag(
  sourceTag: Tag,
  targetWorkspaceId: string,
): SagaIterator<Tag> {
  const tagRequest = {
    tag: {
      name: sourceTag.name,
      wid: +targetWorkspaceId,
    },
  };
  const { data } = yield call(fetchObject, "/toggl/api/tags", {
    method: "POST",
    body: tagRequest,
  });

  return transformFromResponse(data);
}

/**
 * Deletes the specified Toggl tag.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tags.md#delete-a-tag
 */
function* deleteTogglTag(sourceTag: Tag): SagaIterator {
  yield call(fetchObject, `/toggl/api/tags/${sourceTag.id}`, {
    method: "DELETE",
  });
}

/**
 * Fetches Toggl tags in the specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-tags
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
    workspaceId: validStringify(tag?.wid, ""),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tags,
  };
}
