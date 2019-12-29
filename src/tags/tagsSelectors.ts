import { createSelector, Selector } from "reselect";
import * as R from "ramda";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { TagModel, TagsByIdModel } from "./tagsTypes";

const sourceTagsByIdSelector = createSelector(
  (state: ReduxState) => state.tags.source,
  (sourceTagsById): TagsByIdModel => sourceTagsById,
);

const sourceTagsSelector = createSelector(
  sourceTagsByIdSelector,
  (sourceTagsById): TagModel[] => Object.values(sourceTagsById),
);

export const includedSourceTagsSelector = createSelector(
  sourceTagsSelector,
  (sourceTags): TagModel[] =>
    sourceTags.filter(sourceTag => sourceTag.isIncluded),
);

export const sourceTagsForTransferSelector = createSelector(
  includedSourceTagsSelector,
  (sourceTags): TagModel[] =>
    sourceTags.filter(sourceTag => R.isNil(sourceTag.linkedId)),
);

export const sourceTagsInActiveWorkspaceSelector = createSelector(
  sourceTagsSelector,
  activeWorkspaceIdSelector,
  (sourceTags, workspaceId): TagModel[] =>
    sourceTags.filter(tag => tag.workspaceId === workspaceId),
);

export const targetTagIdsSelectorFactory = (
  sourceTagIds: string[],
): Selector<ReduxState, string[]> =>
  createSelector(sourceTagsByIdSelector, (sourceTagsById): string[] => {
    const targetTagIds: string[] = [];

    for (const sourceTagId of sourceTagIds) {
      const sourceTag = sourceTagsById[sourceTagId];
      if (sourceTag && sourceTag.linkedId) {
        targetTagIds.push(sourceTag.linkedId);
      }
    }

    return targetTagIds;
  });
