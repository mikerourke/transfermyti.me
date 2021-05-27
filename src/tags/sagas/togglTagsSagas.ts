import { SagaIterator } from "@redux-saga/types";

import { call } from "redux-saga/effects";

import * as reduxUtils from "~/redux/reduxUtils";
import { EntityGroup, TagModel, ToolName } from "~/typeDefs";
import { validStringify } from "~/utils";

interface TogglTagResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

/**
 * Creates new Toggl tags that correspond to source and returns array of
 * transformed tags.
 */
export function* createTogglTagsSaga(
  sourceTags: TagModel[],
): SagaIterator<TagModel[]> {
  return yield call(reduxUtils.createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTags,
    apiCreateFunc: createTogglTag,
  });
}

/**
 * Deletes all specified source tags from Toggl.
 */
export function* deleteTogglTagsSaga(sourceTags: TagModel[]): SagaIterator {
  yield call(reduxUtils.deleteEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTags,
    apiDeleteFunc: deleteTogglTag,
  });
}

/**
 * Fetches all tags in Toggl workspaces and returns array of transformed tags.
 */
export function* fetchTogglTagsSaga(): SagaIterator<TagModel[]> {
  return yield call(reduxUtils.fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglTagsInWorkspace,
  });
}

/**
 * Creates a new Toggl tag.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tags.md#create-a-tag
 */
function* createTogglTag(
  sourceTag: TagModel,
  targetWorkspaceId: string,
): SagaIterator<TagModel> {
  const tagRequest = {
    tag: {
      name: sourceTag.name,
      wid: +targetWorkspaceId,
    },
  };
  const { data } = yield call(reduxUtils.fetchObject, "/toggl/api/tags", {
    method: "POST",
    body: tagRequest,
  });

  return transformFromResponse(data);
}

/**
 * Deletes the specified Toggl tag.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tags.md#delete-a-tag
 */
function* deleteTogglTag(sourceTag: TagModel): SagaIterator {
  yield call(reduxUtils.fetchObject, `/toggl/api/tags/${sourceTag.id}`, {
    method: "DELETE",
  });
}

/**
 * Fetches Toggl tags in the specified workspace.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-tags
 */
function* fetchTogglTagsInWorkspace(
  workspaceId: string,
): SagaIterator<TagModel[]> {
  const togglTags: TogglTagResponseModel[] = yield call(
    reduxUtils.fetchArray,
    `/toggl/api/workspaces/${workspaceId}/tags`,
  );

  return togglTags.map(transformFromResponse);
}

function transformFromResponse(tag: TogglTagResponseModel): TagModel {
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
