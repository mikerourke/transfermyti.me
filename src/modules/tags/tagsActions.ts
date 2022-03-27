import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, Tag } from "~/typeDefs";

export const createTags = createAsyncAction(
  "@tags/createTagsRequest",
  "@tags/createTagsSuccess",
  "@tags/createTagsFailure",
)<undefined, Record<Mapping, Dictionary<Tag>>, undefined>();

export const deleteTags = createAsyncAction(
  "@tags/deleteTagsRequest",
  "@tags/deleteTagsSuccess",
  "@tags/deleteTagsFailure",
)<undefined, undefined, undefined>();

export const fetchTags = createAsyncAction(
  "@tags/fetchTagsRequest",
  "@tags/fetchTagsSuccess",
  "@tags/fetchTagsFailure",
)<undefined, Record<Mapping, Dictionary<Tag>>, undefined>();

export const isTagIncludedToggled = createAction(
  "@tags/isTagIncludedToggled",
)<string>();

export const areAllTagsIncludedUpdated = createAction(
  "@tags/areAllTagsIncludedUpdated",
)<boolean>();
