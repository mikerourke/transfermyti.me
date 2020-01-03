import { ActionType, createReducer } from "typesafe-actions";
import * as R from "ramda";
import * as tagsActions from "./tagsActions";
import { TagsByIdModel } from "./tagsTypes";

type TagsAction = ActionType<typeof tagsActions>;

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
      ...payload,
      isFetching: false,
    }),
  )
  .handleAction(
    [tagsActions.createTags.request, tagsActions.fetchTags.request],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [tagsActions.createTags.failure, tagsActions.fetchTags.failure],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(tagsActions.flipIsTagIncluded, (state, { payload }) =>
    R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
