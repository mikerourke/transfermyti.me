import { createSelector } from "reselect";
import * as R from "ramda";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { TagModel, TagsByIdModel } from "./tagsTypes";

const selectSourceTagsById = createSelector(
  (state: ReduxState) => state.tags.source,
  (sourceTagsById): TagsByIdModel => sourceTagsById,
);

export const selectSourceTags = createSelector(
  selectSourceTagsById,
  (sourceTagsById): TagModel[] => Object.values(sourceTagsById),
);

export const selectIncludedSourceTags = createSelector(
  selectSourceTags,
  (sourceTags): TagModel[] =>
    sourceTags.filter(sourceTag => sourceTag.isIncluded),
);

export const selectSourceTagsForTransfer = createSelector(
  selectIncludedSourceTags,
  (sourceTags): TagModel[] =>
    sourceTags.filter(sourceTag => R.isNil(sourceTag.linkedId)),
);

export const selectSourceTagsInActiveWorkspace = createSelector(
  selectSourceTags,
  selectActiveWorkspaceId,
  (sourceTags, workspaceId): TagModel[] =>
    sourceTags.filter(tag => tag.workspaceId === workspaceId),
);

export const selectTargetTagIds = createSelector(
  selectSourceTagsById,
  (_: ReduxState, sourceTagIds: string[]) => sourceTagIds,
  (sourceTagsById, sourceTagIds): string[] => {
    const targetTagIds: string[] = [];

    for (const sourceTagId of sourceTagIds) {
      const sourceTag = sourceTagsById[sourceTagId];
      if (sourceTag && sourceTag.linkedId) {
        targetTagIds.push(sourceTag.linkedId);
      }
    }

    return targetTagIds;
  },
);
