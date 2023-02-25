import { createAction, createAsyncAction } from "~/redux/reduxTools";
import type { Mapping, Tag } from "~/typeDefs";

export const areAllTagsIncludedUpdated = createAction<boolean>(
  "@tags/areAllTagsIncludedUpdated",
);

export const isTagIncludedToggled = createAction<string>(
  "@tags/isTagIncludedToggled",
);

export const createTags = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Tag>>,
  undefined
>("@tags/createTags");

export const deleteTags = createAsyncAction<undefined, undefined, undefined>(
  "@tags/deleteTags",
);

export const fetchTags = createAsyncAction<
  undefined,
  Record<Mapping, Dictionary<Tag>>,
  undefined
>("@tags/fetchTags");
