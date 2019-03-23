import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import {
  findIdFieldValue,
  normalizeState,
  swapEntityInclusion,
} from '~/redux/utils';
import * as tagsActions from './tagsActions';
import {
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import { EntityGroup, EntityType } from '~/types/entityTypes';
import { ClockifyTag, TagModel, TogglTag } from '~/types/tagsTypes';

export interface TagsState {
  readonly clockify: ReduxStateEntryForTool<TagModel>;
  readonly toggl: ReduxStateEntryForTool<TagModel>;
  readonly isFetching: boolean;
}

export const initialState: TagsState = {
  clockify: {
    byId: {},
    idValues: [],
  },
  toggl: {
    byId: {},
    idValues: [],
  },
  isFetching: false,
};

const schemaProcessStrategy = (value: ClockifyTag | TogglTag): TagModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId: findIdFieldValue(value, EntityType.Workspace),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [combineActions(
      getType(tagsActions.clockifyTagsFetch.success),
      getType(tagsActions.clockifyTagsTransfer.success),
    )]: (
      state: TagsState,
      { payload: tags }: ReduxAction<ClockifyTag[]>,
    ): TagsState =>
      normalizeState(
        ToolName.Clockify,
        EntityGroup.Tags,
        schemaProcessStrategy,
        state,
        tags,
      ),

    [getType(tagsActions.togglTagsFetch.success)]: (
      state: TagsState,
      { payload: tags }: ReduxAction<TogglTag[]>,
    ): TagsState =>
      normalizeState(
        ToolName.Toggl,
        EntityGroup.Tags,
        schemaProcessStrategy,
        state,
        tags,
      ),

    [combineActions(
      getType(tagsActions.clockifyTagsFetch.request),
      getType(tagsActions.togglTagsFetch.request),
      getType(tagsActions.clockifyTagsTransfer.request),
    )]: (state: TagsState): TagsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(tagsActions.clockifyTagsFetch.success),
      getType(tagsActions.clockifyTagsFetch.failure),
      getType(tagsActions.togglTagsFetch.success),
      getType(tagsActions.togglTagsFetch.failure),
      getType(tagsActions.clockifyTagsTransfer.success),
      getType(tagsActions.clockifyTagsTransfer.failure),
    )]: (state: TagsState): TagsState => ({
      ...state,
      isFetching: false,
    }),

    [getType(tagsActions.updateIsTagIncluded)]: (
      state: TagsState,
      { payload: tagId }: ReduxAction<string>,
    ): TagsState => swapEntityInclusion(state, EntityType.Tag, tagId),
  },
  initialState,
);
