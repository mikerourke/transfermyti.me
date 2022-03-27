import { isNil, propOr } from "ramda";
import {
  createSelector,
  createStructuredSelector,
  type Selector,
} from "reselect";

import { mappingByToolNameSelector } from "~/modules/allEntities/allEntitiesSelectors";
import { sourceTimeEntryCountByTagIdSelector } from "~/modules/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/modules/workspaces/workspacesSelectors";
import type {
  EntityTableRecord,
  Mapping,
  ReduxState,
  Tag,
  ToolName,
} from "~/typeDefs";

const sourceTagsByIdSelector = createSelector(
  (state: ReduxState) => state.tags.source,
  (sourceTagsById): Dictionary<Tag> => sourceTagsById,
);

const sourceTagsSelector = createSelector(
  sourceTagsByIdSelector,
  (sourceTagsById): Tag[] => Object.values(sourceTagsById),
);

const targetTagsByIdSelector = createSelector(
  (state: ReduxState) => state.tags.target,
  (targetTagsById): Dictionary<Tag> => targetTagsById,
);

const targetTagsSelector = createSelector(
  targetTagsByIdSelector,
  (targetTagsById): Tag[] => Object.values(targetTagsById),
);

const tagsByMappingSelector = createStructuredSelector<
  ReduxState,
  Record<Mapping, Tag[]>
>({
  source: sourceTagsSelector,
  target: targetTagsSelector,
});

export const includedSourceTagsSelector = createSelector(
  sourceTagsSelector,
  (sourceTags): Tag[] => sourceTags.filter((sourceTag) => sourceTag.isIncluded),
);

export const sourceTagsForTransferSelector = createSelector(
  includedSourceTagsSelector,
  (sourceTags): Tag[] =>
    sourceTags.filter((sourceTag) => isNil(sourceTag.linkedId)),
);

const sourceTagsInActiveWorkspaceSelector = createSelector(
  sourceTagsSelector,
  activeWorkspaceIdSelector,
  (sourceTags, workspaceId): Tag[] =>
    sourceTags.filter((tag) => tag.workspaceId === workspaceId),
);

export const tagsForInclusionsTableSelector = createSelector(
  (state: ReduxState) => state.allEntities.areExistsInTargetShown,
  sourceTagsInActiveWorkspaceSelector,
  sourceTimeEntryCountByTagIdSelector,
  (
    areExistsInTargetShown,
    sourceTags,
    timeEntryCountByTagId,
  ): EntityTableRecord<Tag>[] => {
    const tagTableRecords: EntityTableRecord<Tag>[] = [];

    for (const sourceTag of sourceTags) {
      const existsInTarget = sourceTag.linkedId !== null;
      if (existsInTarget && !areExistsInTargetShown) {
        continue;
      }

      const entryCount = propOr<number, Record<string, number>, number>(
        0,
        sourceTag.id,
        timeEntryCountByTagId,
      );

      tagTableRecords.push({
        ...sourceTag,
        entryCount,
        existsInTarget,
        isActiveInSource: true,
        isActiveInTarget: existsInTarget,
      });
    }

    return tagTableRecords;
  },
);

export const tagsTotalCountsByTypeSelector = createSelector(
  tagsForInclusionsTableSelector,
  (tagsForInclusionTable) =>
    tagsForInclusionTable.reduce(
      (
        acc,
        { entryCount, existsInTarget, isIncluded }: EntityTableRecord<Tag>,
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
