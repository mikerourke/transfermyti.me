import { createAction, createAsyncAction } from "typesafe-actions";
import { Mapping } from "~/allEntities/allEntitiesTypes";
import { TagsByIdModel } from "./tagsTypes";

export const createTags = createAsyncAction(
  "@tags/CREATE_TAGS_REQUEST",
  "@tags/CREATE_TAGS_SUCCESS",
  "@tags/CREATE_TAGS_FAILURE",
)<void, Record<Mapping, TagsByIdModel>, void>();

export const fetchTags = createAsyncAction(
  "@tags/FETCH_TAGS_REQUEST",
  "@tags/FETCH_TAGS_SUCCESS",
  "@tags/FETCH_TAGS_FAILURE",
)<void, Record<Mapping, TagsByIdModel>, void>();

export const flipIsTagIncluded = createAction("@tags/FLIP_IS_INCLUDED")<
  string
>();
