import { createSelector, createStructuredSelector, Selector } from "reselect";
import * as R from "ramda";
import { mappingByToolNameSelector } from "~/app/appSelectors";
import { sourceTimeEntryCountByTagIdSelector } from "~/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import {
  Mapping,
  ReduxState,
  TableViewModel,
  TagModel,
  TagsByIdModel,
  ToolName,
} from "~/typeDefs";

const sourceTagsByIdSelector = createSelector(
  (state: ReduxState) => state.tags.source,
  (sourceTagsById): TagsByIdModel => sourceTagsById,
);

const sourceTagsSelector = createSelector(
  sourceTagsByIdSelector,
  (sourceTagsById): TagModel[] => Object.values(sourceTagsById),
);

const targetTagsByIdSelector = createSelector(
  (state: ReduxState) => state.tags.target,
  (targetTagsById): TagsByIdModel => targetTagsById,
);

const targetTagsSelector = createSelector(
  targetTagsByIdSelector,
  (targetTagsById): TagModel[] => Object.values(targetTagsById),
);

const tagsByMappingSelector = createStructuredSelector<
  ReduxState,
  Record<Mapping, TagModel[]>
>({
  source: sourceTagsSelector,
  target: targetTagsSelector,
});

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

const sourceTagsInActiveWorkspaceSelector = createSelector(
  sourceTagsSelector,
  activeWorkspaceIdSelector,
  (sourceTags, workspaceId): TagModel[] =>
    sourceTags.filter(tag => tag.workspaceId === workspaceId),
);

export const tagsForInclusionTableSelector = createSelector(
  (state: ReduxState) => state.allEntities.areExistsInTargetShown,
  sourceTagsInActiveWorkspaceSelector,
  sourceTimeEntryCountByTagIdSelector,
  (
    areExistsInTargetShown,
    sourceTags,
    timeEntryCountByTagId,
  ): TableViewModel<TagModel>[] =>
    sourceTags.reduce((acc, sourceTag) => {
      const existsInTarget = sourceTag.linkedId !== null;
      if (existsInTarget && !areExistsInTargetShown) {
        return acc;
      }

      const entryCount = R.propOr<number, Record<string, number>, number>(
        0,
        sourceTag.id,
        timeEntryCountByTagId,
      );

      return [
        ...acc,
        {
          ...sourceTag,
          entryCount,
          existsInTarget,
          isActiveInSource: true,
          isActiveInTarget: existsInTarget,
        },
      ];
    }, [] as TableViewModel<TagModel>[]),
);

export const tagsTotalCountsByTypeSelector = createSelector(
  tagsForInclusionTableSelector,
  tagsForInclusionTable =>
    tagsForInclusionTable.reduce(
      (
        acc,
        { entryCount, existsInTarget, isIncluded }: TableViewModel<TagModel>,
      ) => ({
        entryCount: acc.entryCount + entryCount,
        existsInTarget: acc.existsInTarget + (existsInTarget ? 1 : 0),
        isIncluded: acc.isIncluded + (isIncluded ? 1 : 0),
      }),
      {
        entryCount: 0,
        existsInTarget: 0,
        isIncluded: 0,
      },
    ),
);

export const tagIdsByNameBySelectorFactory = (
  toolName: ToolName,
): Selector<ReduxState, Record<string, string>> =>
  createSelector(
    mappingByToolNameSelector,
    tagsByMappingSelector,
    (mappingByToolName, tagsByMapping): Record<string, string> => {
      const toolMapping = mappingByToolName[toolName];
      const tags = tagsByMapping[toolMapping];

      const tagIdsByName: Record<string, string> = {};
      for (const tag of tags) {
        tagIdsByName[tag.name] = tag.id;
      }

      return tagIdsByName;
    },
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
