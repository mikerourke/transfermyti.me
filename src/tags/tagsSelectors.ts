import { createSelector } from "reselect";
import * as R from "ramda";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { TagModel } from "./tagsTypes";

export const selectSourceTags = createSelector(
  (state: ReduxState) => state.tags.source,
  (tagsById): TagModel[] => Object.values(tagsById),
);

export const selectSourceTagsForTransfer = createSelector(
  selectSourceTags,
  (sourceTags): TagModel[] =>
    sourceTags.filter(sourceTag =>
      R.and(sourceTag.isIncluded, R.isNil(sourceTag.linkedId)),
    ),
);

export const selectSourceTagsInActiveWorkspace = createSelector(
  selectSourceTags,
  selectActiveWorkspaceId,
  (sourceTags, workspaceId): TagModel[] =>
    sourceTags.filter(tag => tag.workspaceId === workspaceId),
);
