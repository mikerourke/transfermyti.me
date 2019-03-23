import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { selectTogglTimeEntriesById } from '~/redux/entities/timeEntries/timeEntriesSelectors';
import { CreateNamedEntityRequest, ReduxState } from '~/types/commonTypes';
import { TagModel } from '~/types/tagsTypes';

export const selectTogglTags = createSelector(
  (state: ReduxState) => state.entities.tags.toggl.byId,
  (tagsById): TagModel[] => Object.values(tagsById),
);

const selectTagsWithEntryCount = createSelector(
  selectTogglTags,
  selectTogglTimeEntriesById,
  (tags, timeEntriesById) => {
    const timeEntryCountByTagId = {};

    Object.values(timeEntriesById).forEach(timeEntry => {
      const tagNames = get(timeEntry, 'tags', []) as string[];

      tagNames.forEach(tagName => {
        const { id = null } = tags.find(({ name }) => name === tagName);
        if (!id) return;

        const existingCount = get(timeEntryCountByTagId, id, 0);
        timeEntryCountByTagId[id] = existingCount + 1;
      });
    });

    return tags.map(tag => ({
      ...tag,
      entryCount: get(timeEntryCountByTagId, tag.id, 0),
    }));
  },
);

export const selectTogglTagsByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTagsWithEntryCount,
    tags => {
      const tagsToUse = inclusionsOnly ? findTogglInclusions(tags) : tags;
      return groupByWorkspace(tagsToUse);
    },
  );

export const selectTagsTransferPayloadForWorkspace = createSelector(
  selectTogglTagsByWorkspaceFactory(true),
  inclusionsByWorkspaceId => (
    workspaceIdToGet: string,
  ): CreateNamedEntityRequest[] => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as TagModel[];
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { workspaceId, name }) => {
      if (workspaceIdToGet !== workspaceId) return acc;
      return [...acc, { name }];
    }, []);
  },
);
