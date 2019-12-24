import { createAsyncAction, createAction } from "typesafe-actions";
import { MappedEntityRecordsModel } from "~/common/commonTypes";
import { TagModel } from "./tagsTypes";

export const createClockifyTags = createAsyncAction(
  "@tags/CREATE_CLOCKIFY_TAGS_REQUEST",
  "@tags/CREATE_CLOCKIFY_TAGS_SUCCESS",
  "@tags/CREATE_CLOCKIFY_TAGS_FAILURE",
)<string, void, void>();

export const createTogglTags = createAsyncAction(
  "@tags/CREATE_TOGGL_TAGS_REQUEST",
  "@tags/CREATE_TOGGL_TAGS_SUCCESS",
  "@tags/CREATE_TOGGL_TAGS_FAILURE",
)<string, void, void>();

export const fetchClockifyTags = createAsyncAction(
  "@tags/FETCH_CLOCKIFY_TAGS_REQUEST",
  "@tags/FETCH_CLOCKIFY_TAGS_SUCCESS",
  "@tags/FETCH_CLOCKIFY_TAGS_FAILURE",
)<string, MappedEntityRecordsModel<TagModel>, void>();

export const fetchTogglTags = createAsyncAction(
  "@tags/FETCH_TOGGL_TAGS_REQUEST",
  "@tags/FETCH_TOGGL_TAGS_SUCCESS",
  "@tags/FETCH_TOGGL_TAGS_FAILURE",
)<string, MappedEntityRecordsModel<TagModel>, void>();

export const flipIsTagIncluded = createAction("@tags/FLIP_IS_INCLUDED")<
  string
>();
