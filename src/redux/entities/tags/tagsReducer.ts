import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import { get } from 'lodash';
import {
  findIdFieldValue,
  flipEntityInclusion,
  normalizeState,
} from '~/redux/utils';
import { togglTimeEntriesFetch } from '~/redux/entities/timeEntries/timeEntriesActions';
import * as tagsActions from './tagsActions';
import {
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import { EntityGroup, EntityType } from '~/types/entityTypes';
import { ClockifyTag, TagModel, TogglTag } from '~/types/tagsTypes';
import { TogglTimeEntry } from '~/types/timeEntriesTypes';

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

const appendEntryCountByTagName = <TTimeEntry>(
  toolName: ToolName,
  state: TagsState,
  timeEntries: Array<TTimeEntry>,
) => {
  const timeEntryCountByTagId = {};
  const tags = Object.values(state[toolName].byId);

  timeEntries.forEach(timeEntry => {
    const tagNames = get(timeEntry, 'tags', []) as Array<string>;

    tagNames.forEach(tagName => {
      const { id = null } = tags.find(({ name }) => name === tagName);
      if (!id) return;

      const existingCount = get(timeEntryCountByTagId, id, 0);
      timeEntryCountByTagId[id] = existingCount + 1;
    });
  });

  const updatedTagsById = tags.reduce(
    (acc, tag) => ({
      ...acc,
      [tag.id]: {
        ...tag,
        entryCount: tag.entryCount + get(timeEntryCountByTagId, tag.id, 0),
      },
    }),
    {},
  );

  return {
    ...state,
    [toolName]: {
      ...state[toolName],
      byId: updatedTagsById,
    },
  };
};

export const tagsReducer = handleActions(
  {
    [combineActions(
      getType(tagsActions.clockifyTagsFetch.success),
      getType(tagsActions.clockifyTagsTransfer.success),
    )]: (
      state: TagsState,
      { payload: tags }: ReduxAction<Array<ClockifyTag>>,
    ): TagsState =>
      normalizeState(
        ToolName.Clockify,
        EntityGroup.Tags,
        state,
        tags,
        schemaProcessStrategy,
      ),

    [getType(tagsActions.togglTagsFetch.success)]: (
      state: TagsState,
      { payload: tags }: ReduxAction<Array<TogglTag>>,
    ): TagsState =>
      normalizeState(
        ToolName.Toggl,
        EntityGroup.Tags,
        state,
        tags,
        schemaProcessStrategy,
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

    [getType(tagsActions.flipIsTagIncluded)]: (
      state: TagsState,
      { payload: tagId }: ReduxAction<string>,
    ): TagsState => flipEntityInclusion(state, EntityType.Tag, tagId),

    [getType(togglTimeEntriesFetch.success)]: (
      state: TagsState,
      { payload: timeEntries }: ReduxAction<Array<TogglTimeEntry>>,
    ) => appendEntryCountByTagName(ToolName.Toggl, state, timeEntries),
  },
  initialState,
);
