import { call } from "redux-saga/effects";
import { SagaIterator } from "@redux-saga/types";
import { fetchEntitiesForTool, createEntitiesForTool } from "~/redux/sagaUtils";
import { fetchArray, fetchObject } from "~/utils";
import { EntityGroup, HttpMethod, ToolName } from "~/common/commonTypes";
import { TagModel } from "~/tags/tagsTypes";

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

/**
 * Creates new Toggl tags that correspond to source and returns an array of
 * transformed tags.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/tags.md#create-a-tag
 */
export function* createTogglTagsSaga(
  sourceTags: TagModel[],
): SagaIterator<TagModel[]> {
  return yield call(createEntitiesForTool, {
    toolName: ToolName.Toggl,
    sourceRecords: sourceTags,
    creatorFunc: createTogglTag,
  });
}

/**
 * Fetches all tags in Toggl workspaces and returns the result.
 * @see https://github.com/toggl/toggl_api_docs/blob/master/chapters/workspaces.md#get-workspace-tags
 */
export function* fetchTogglTagsSaga(): SagaIterator<TagModel[]> {
  return yield call(fetchEntitiesForTool, {
    toolName: ToolName.Toggl,
    fetchFunc: fetchTogglTagsInWorkspace,
  });
}

function* createTogglTag(
  sourceTag: TagModel,
  workspaceId: string,
): SagaIterator<TagModel | null> {
  const tagRequest = transformToRequest(sourceTag, workspaceId);
  const { data } = yield call(fetchObject, `/toggl/api/tags`, {
    method: HttpMethod.Post,
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

function transformToRequest(
  tag: TagModel,
  workspaceId: string,
): TogglTagRequestModel {
  return {
    name: tag.name,
    wid: +workspaceId,
  };
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
