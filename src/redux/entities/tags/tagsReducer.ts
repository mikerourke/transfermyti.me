import { handleActions, combineActions } from 'redux-actions';
import { normalize, schema } from 'normalizr';
import {
  clockifyTagsFetchStarted,
  clockifyTagsFetchSuccess,
  clockifyTagsFetchFailure,
  togglTagsFetchStarted,
  togglTagsFetchSuccess,
  togglTagsFetchFailure,
} from './tagsActions';
import { TagModel } from '../../../types/tagsTypes';

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

const tagsSchema = new schema.Entity(
  'tags',
  {},
  {
    idAttribute: value => value.id.toString(),
    processStrategy: value => ({
      id: value.id.toString(),
      name: value.name,
      workspaceId: 'wid' in value ? value.wid.toString() : value.workspaceId,
      isIncluded: true,
    }),
  },
);

export default handleActions(
  {
    [clockifyTagsFetchSuccess]: (
      state: TagsState,
      { payload }: any,
    ): TagsState => {
      const { entities, result } = normalize(payload, [tagsSchema]);
      return {
        ...state,
        clockify: {
          ...state.clockify,
          tagsById: entities.tags,
          tagIds: result,
        },
      };
    },

    [togglTagsFetchSuccess]: (
      state: TagsState,
      { payload }: any,
    ): TagsState => {
      const { entities, result } = normalize(payload, [tagsSchema]);
      return {
        ...state,
        toggl: {
          ...state.toggl,
          tagsById: entities.tags,
          tagIds: result,
        },
      };
    },

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
  },
  initialState,
);
