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
  clockifyTagsTransferFailure,
  clockifyTagsTransferStarted,
  clockifyTagsTransferSuccess,
  updateIsTagIncluded,
} from './tagsActions';
import {
  EntityGroup,
  EntityType,
  ReduxStateEntryForTool,
  ToolName,
} from '../../../types/commonTypes';
import { ClockifyTag, TagModel, TogglTag } from '../../../types/tagsTypes';
import { ReduxAction } from '../../rootReducer';

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
  workspaceId: getEntityIdFieldValue(value, EntityType.Workspace),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [combineActions(clockifyTagsFetchSuccess, clockifyTagsTransferSuccess)]: (
      state: TagsState,
      { payload: tags }: ReduxAction<ClockifyTag[]>,
    ): TagsState =>
      getEntityNormalizedState(
        ToolName.Clockify,
        EntityGroup.Tags,
        schemaProcessStrategy,
        state,
        tags,
      ),

    [togglTagsFetchSuccess]: (
      state: TagsState,
      { payload: tags }: ReduxAction<TogglTag[]>,
    ): TagsState =>
      getEntityNormalizedState(
        ToolName.Toggl,
        EntityGroup.Tags,
        schemaProcessStrategy,
        state,
        tags,
      ),

    [combineActions(
      clockifyTagsFetchStarted,
      togglTagsFetchStarted,
      clockifyTagsTransferStarted,
    )]: (state: TagsState): TagsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyTagsFetchSuccess,
      clockifyTagsFetchFailure,
      togglTagsFetchSuccess,
      togglTagsFetchFailure,
      clockifyTagsTransferSuccess,
      clockifyTagsTransferFailure,
    )]: (state: TagsState): TagsState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsTagIncluded]: (
      state: TagsState,
      { payload: tagId }: ReduxAction<string>,
    ): TagsState => updateIsEntityIncluded(state, EntityType.Tag, tagId),
  },
  initialState,
);
