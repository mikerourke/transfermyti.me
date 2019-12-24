import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { TagModel } from "./tagsTypes";

export const selectTargetTags = createSelector(
  (state: ReduxState) => state.tags.target,
  (tagsById): TagModel[] => Object.values(tagsById),
);

const selectTargetTagsInWorkspace = createSelector(
  selectTargetTags,
  (_: unknown, workspaceId: string) => workspaceId,
  (targetTags, workspaceId): TagModel[] =>
    targetTags.filter(tag => tag.workspaceId === workspaceId),
);

export const selectTargetTagsForTransfer = createSelector(
  selectTargetTagsInWorkspace,
  targetTags => targetTags.filter(tag => tag.isIncluded),
);
