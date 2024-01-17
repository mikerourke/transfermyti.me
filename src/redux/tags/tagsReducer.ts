import { lensPath, not, over } from "ramda";

import { updateAreAllRecordsIncluded } from "~/api/updateAreAllRecordsIncluded";
import { allEntitiesFlushed } from "~/redux/allEntities/allEntitiesActions";
import {
  createReducer,
  isActionOf,
  type Action,
  type ActionType,
} from "~/redux/reduxTools";
import { Mapping, type Tag } from "~/types";

import * as tagsActions from "./tagsActions";

export type TagsState = Readonly<{
  source: Dictionary<Tag>;
  target: Dictionary<Tag>;
  isFetching: boolean;
}>;

export const tagsInitialState: TagsState = {
  source: {},
  target: {},
  isFetching: false,
};

export const tagsReducer = createReducer<TagsState>(
  tagsInitialState,
  (builder) => {
    builder
      .addCase(tagsActions.areAllTagsIncludedUpdated, (state, { payload }) => ({
        ...state,
        source: updateAreAllRecordsIncluded(state.source, payload),
      }))
      .addCase(tagsActions.isTagIncludedToggled, (state, { payload }) =>
        over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
      )
      .addMatcher(isTagsApiSuccessAction, (state, { payload }) => ({
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
      }))
      .addMatcher(isTagsApiRequestAction, (state) => {
        state.isFetching = true;
      })
      .addMatcher(isTagsApiFailureAction, (state) => {
        state.isFetching = false;
      })
      .addMatcher(isResetTagsStateAction, () => ({
        ...tagsInitialState,
      }));
  },
);

type TagsCreateOrFetchSuccessAction = ActionType<
  typeof tagsActions.createTags.success | typeof tagsActions.fetchTags.success
>;

function isTagsApiSuccessAction(
  action: Action,
): action is TagsCreateOrFetchSuccessAction {
  return isActionOf(
    [tagsActions.createTags.success, tagsActions.fetchTags.success],
    action,
  );
}

type TagsApiRequestAction = ActionType<
  | typeof tagsActions.createTags.request
  | typeof tagsActions.deleteTags.request
  | typeof tagsActions.fetchTags.request
>;

function isTagsApiRequestAction(
  action: Action,
): action is TagsApiRequestAction {
  return isActionOf(
    [
      tagsActions.createTags.request,
      tagsActions.deleteTags.request,
      tagsActions.fetchTags.request,
    ],
    action,
  );
}

type TagsApiFailureAction = ActionType<
  | typeof tagsActions.createTags.failure
  | typeof tagsActions.deleteTags.failure
  | typeof tagsActions.fetchTags.failure
>;

function isTagsApiFailureAction(
  action: Action,
): action is TagsApiFailureAction {
  return isActionOf(
    [
      tagsActions.createTags.failure,
      tagsActions.deleteTags.failure,
      tagsActions.fetchTags.failure,
    ],
    action,
  );
}

type ResetTagsStateAction = ActionType<
  typeof tagsActions.deleteTags.success | typeof allEntitiesFlushed
>;

function isResetTagsStateAction(
  action: Action,
): action is ResetTagsStateAction {
  return isActionOf(
    [tagsActions.deleteTags.success, allEntitiesFlushed],
    action,
  );
}
