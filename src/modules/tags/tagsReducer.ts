import * as R from "ramda";
import { type ActionType, createReducer } from "typesafe-actions";

import { updateAreAllRecordsIncluded } from "~/entityOperations/updateAreAllRecordsIncluded";
import { flushAllEntities } from "~/modules/allEntities/allEntitiesActions";
import * as tagsActions from "~/modules/tags/tagsActions";
import { Mapping, type TagsByIdModel } from "~/typeDefs";

type TagsAction = ActionType<typeof tagsActions | typeof flushAllEntities>;

export interface TagsState {
  readonly source: TagsByIdModel;
  readonly target: TagsByIdModel;
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
  .handleAction(tagsActions.flipIsTagIncluded, (state, { payload }) =>
    R.over(R.lensPath([Mapping.Source, payload, "isIncluded"]), R.not, state),
  )
  .handleAction(tagsActions.updateAreAllTagsIncluded, (state, { payload }) => ({
    ...state,
    source: updateAreAllRecordsIncluded(state.source, payload),
  }))
  .handleAction([tagsActions.deleteTags.success, flushAllEntities], () => ({
    ...initialState,
  }));
