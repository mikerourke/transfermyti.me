import { createReducer, ActionType } from "typesafe-actions";
import * as R from "ramda";
import * as tagsActions from "./tagsActions";
import { TagModel } from "~/tags/tagsTypes";

type TagsAction = ActionType<typeof tagsActions>;

export interface TagsState {
  readonly source: Record<string, TagModel>;
  readonly target: Record<string, TagModel>;
  readonly isFetching: boolean;
}

export const initialState: TagsState = {
  source: {},
  target: {},
  isFetching: false,
};

export const tagsReducer = createReducer<TagsState, TagsAction>(initialState)
  .handleAction(
    [tagsActions.fetchClockifyTags.success, tagsActions.fetchTogglTags.success],
    (state, { payload }) => ({
      ...state,
      [payload.mapping]: {
        ...state[payload.mapping],
        ...payload.recordsById,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      tagsActions.createClockifyTags.request,
      tagsActions.createTogglTags.request,
      tagsActions.fetchClockifyTags.request,
      tagsActions.fetchTogglTags.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      tagsActions.createClockifyTags.success,
      tagsActions.createTogglTags.success,
      tagsActions.createClockifyTags.failure,
      tagsActions.createTogglTags.failure,
      tagsActions.fetchClockifyTags.failure,
      tagsActions.fetchTogglTags.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(tagsActions.flipIsTagIncluded, (state, { payload }) =>
    R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
