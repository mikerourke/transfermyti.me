import { SagaIterator } from "@redux-saga/types";
import { call } from "redux-saga/effects";
import { fetchArray, fetchObject } from "~/redux/sagaUtils";
import { EntityGroup, ToolName } from "~/allEntities/allEntitiesTypes";
import { createEntitiesForTool } from "~/redux/sagaUtils/createEntitiesForTool";
import { fetchEntitiesForTool } from "~/redux/sagaUtils/fetchEntitiesForTool";
import { TagModel } from "~/tags/tagsTypes";

interface TogglTagResponseModel {
  id: number;
  wid: number;
  name: string;
  at: string;
}

/**
 * Creates new Toggl tags that correspond to source and returns array of
 * transformed tags.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tags.md#create-a-tag
 */
export function* createTogglTagsSaga(
  sourceTags: TagModel[],
): SagaIterator<TagModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTags,
    apiCreateFunc: createTogglTag,
  });
}

/**
 * Fetches all tags in Toggl workspaces and returns array of transformed tags.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-tags
 */
export function* fetchTogglTagsSaga(): SagaIterator<TagModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    apiFetchFunc: fetchTogglTagsInWorkspace,
  });
}

function* createTogglTag(
  sourceTag: TagModel,
  targetWorkspaceId: string,
): SagaIterator<TagModel> {
  const tagRequest = {
    name: sourceTag.name,
    wid: +targetWorkspaceId,
  };
  const { data } = yield call(fetchObject, "/toggl/api/tags", {
    method: "POST",
    body: tagRequest,
  });

  return transformFromResponse(data);
}

function* fetchTogglTagsInWorkspace(
  workspaceId: string,
): SagaIterator<TagModel[]> {
  const togglTags: TogglTagResponseModel[] = yield call(
    fetchArray,
    `/toggl/api/workspaces/${workspaceId}/tags`,
  );

  return togglTags.map(transformFromResponse);
}

function transformFromResponse(tag: TogglTagResponseModel): TagModel {
  return {
    id: tag.id.toString(),
    name: tag.name,
    workspaceId: tag.wid.toString(),
    entryCount: 0,
    linkedId: null,
    isIncluded: true,
    memberOf: EntityGroup.Tags,
  };
}
