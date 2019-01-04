import { combineActions, handleActions } from 'redux-actions';
import {
  getEntityIdFieldValue,
  getEntityNormalizedState,
  updateIsEntityIncluded,
} from '../../utils';
import {
  clockifyTagsFetchFailure,
  clockifyTagsFetchStarted,
  clockifyTagsFetchSuccess,
  togglTagsFetchFailure,
  togglTagsFetchStarted,
  togglTagsFetchSuccess,
  updateIsTagIncluded,
} from './tagsActions';
import { EntityType, ToolName } from '../../../types/commonTypes';
import { ClockifyTag, TagModel, TogglTag } from '../../../types/tagsTypes';
import { ReduxAction } from '../../rootReducer';

interface TagsEntryForTool {
  readonly tagsById: Record<string, TagModel>;
  readonly tagIds: string[];
}

export interface TagsState {
  readonly clockify: TagsEntryForTool;
  readonly toggl: TagsEntryForTool;
  readonly isFetching: boolean;
}

export const initialState: TagsState = {
  clockify: {
    tagsById: {},
    tagIds: [],
  },
  toggl: {
    tagsById: {},
    tagIds: [],
  },
  isFetching: false,
};

const schemaProcessStrategy = (value: ClockifyTag | TogglTag): TagModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId: getEntityIdFieldValue(value, EntityType.Workspace),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [clockifyTagsFetchSuccess]: (
      state: TagsState,
      { payload: tags }: ReduxAction<ClockifyTag[]>,
    ): TagsState =>
      getEntityNormalizedState<TagsState, ClockifyTag[]>(
        ToolName.Clockify,
        EntityType.Tag,
        schemaProcessStrategy,
        state,
        tags,
      ),

    [togglTagsFetchSuccess]: (
      state: TagsState,
      { payload: tags }: ReduxAction<TogglTag[]>,
    ): TagsState =>
      getEntityNormalizedState<TagsState, TogglTag[]>(
        ToolName.Toggl,
        EntityType.Tag,
        schemaProcessStrategy,
        state,
        tags,
      ),

    [combineActions(clockifyTagsFetchStarted, togglTagsFetchStarted)]: (
      state: TagsState,
    ): TagsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyTagsFetchSuccess,
      clockifyTagsFetchFailure,
      togglTagsFetchSuccess,
      togglTagsFetchFailure,
    )]: (state: TagsState): TagsState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsTagIncluded]: (
      state: TagsState,
      { payload: tagId }: ReduxAction<string>,
    ): TagsState =>
      updateIsEntityIncluded<TagsState>(state, EntityType.Tag, tagId),
  },
  initialState,
);
