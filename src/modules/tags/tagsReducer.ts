import { lensPath, not, over } from "ramda";
import { type ActionType, createReducer } from "typesafe-actions";

import { updateAreAllRecordsIncluded } from "~/entityOperations/updateAreAllRecordsIncluded";
import { allEntitiesFlushed } from "~/modules/allEntities/allEntitiesActions";
import * as tagsActions from "~/modules/tags/tagsActions";
import { Mapping, type Tag } from "~/typeDefs";

type TagsAction = ActionType<typeof tagsActions | typeof allEntitiesFlushed>;

export interface TagsState {
  readonly source: Dictionary<Tag>;
  readonly target: Dictionary<Tag>;
  readonly isFetching: boolean;
}

export const initialState: TagsState = {
  source: {},
  target: {},
  isFetching: false,
};

export const tagsReducer = createReducer<TagsState, TagsAction>(initialState)
  .handleAction(
    [tagsActions.createTags.success, tagsActions.fetchTags.success],
    (state, { payload }) => ({
      ...state,
      source: {
        ...state.source,
        ...payload.source,
      },
      target: {
        ...state.target,
        ...payload.target,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      tagsActions.createTags.request,
      tagsActions.deleteTags.request,
      tagsActions.fetchTags.request,
    ],
    (state) => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      tagsActions.createTags.failure,
      tagsActions.deleteTags.failure,
      tagsActions.fetchTags.failure,
    ],
    (state) => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(tagsActions.isTagIncludedToggled, (state, { payload }) =>
    over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
  )
  .handleAction(
    tagsActions.areAllTagsIncludedUpdated,
    (state, { payload }) => ({
      ...state,
      source: updateAreAllRecordsIncluded(state.source, payload),
    }),
  )
  .handleAction([tagsActions.deleteTags.success, allEntitiesFlushed], () => ({
    ...initialState,
  }));
