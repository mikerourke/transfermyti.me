import { createAction, createAsyncAction } from "typesafe-actions";

import type { Mapping, Tag } from "~/typeDefs";

export const createTags = createAsyncAction(
  "@tags/CREATE_TAGS_REQUEST",
  "@tags/CREATE_TAGS_SUCCESS",
  "@tags/CREATE_TAGS_FAILURE",
)<void, Record<Mapping, Dictionary<Tag>>, void>();

export const deleteTags = createAsyncAction(
  "@tags/DELETE_TAGS_REQUEST",
  "@tags/DELETE_TAGS_SUCCESS",
  "@tags/DELETE_TAGS_FAILURE",
)<void, void, void>();

export const fetchTags = createAsyncAction(
  "@tags/FETCH_TAGS_REQUEST",
  "@tags/FETCH_TAGS_SUCCESS",
  "@tags/FETCH_TAGS_FAILURE",
)<void, Record<Mapping, Dictionary<Tag>>, void>();

export const flipIsTagIncluded = createAction(
  "@tags/FLIP_IS_INCLUDED",
)<string>();

export const updateAreAllTagsIncluded = createAction(
  "@tags/UPDATE_ARE_ALL_INCLUDED",
)<boolean>();
