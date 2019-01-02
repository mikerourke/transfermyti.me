import { combineActions, handleActions } from 'redux-actions';
import ReduxEntity from '../../../utils/ReduxEntity';
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
  workspaceId: ReduxEntity.getIdFieldValue(value, EntityType.Workspace),
  entryCount: 0,
  isIncluded: true,
});

const reduxEntity = new ReduxEntity(EntityType.Tag, schemaProcessStrategy);

export default handleActions(
  {
    [clockifyTagsFetchSuccess]: (
      state: TagsState,
      { payload }: ReduxAction<ClockifyTag[]>,
    ): TagsState =>
      reduxEntity.getNormalizedState<TagsState, ClockifyTag[]>(
        ToolName.Clockify,
        state,
        payload,
      ),

    [togglTagsFetchSuccess]: (
      state: TagsState,
      { payload }: ReduxAction<TogglTag[]>,
    ): TagsState =>
      reduxEntity.getNormalizedState<TagsState, TogglTag[]>(
        ToolName.Toggl,
        state,
        payload,
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
    ): TagsState => reduxEntity.updateIsIncluded<TagsState>(state, tagId),
  },
  initialState,
);
