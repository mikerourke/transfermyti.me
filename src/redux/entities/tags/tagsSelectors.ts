import { createSelector } from 'reselect';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import { getEntityRecordsByWorkspaceId } from '../../utils';
import { EntityType } from '../../../types/commonTypes';
import { TagModel } from '../../../types/tagsTypes';
import { State } from '../../rootReducer';

export const selectClockifyTagRecords = createSelector(
  (state: State) => state.entities.tags.clockify.tagsById,
  (tagsById): TagModel[] => Object.values(tagsById),
);

export const selectTogglTagsById = createSelector(
  (state: State) => state.entities.tags.toggl.tagsById,
  tagsById => tagsById,
);

export const selectTogglTagIdsByName = createSelector(
  selectTogglTagsById,
  (tagsById): Record<string, string> =>
    Object.values(tagsById).reduce(
      (acc, { id, name }) => ({
        ...acc,
        [name]: id.toString(),
      }),
      {},
    ),
);

export const selectTogglTagRecords = createSelector(
  (state: State) => state.entities.tags.toggl.tagsById,
  (tagsById): TagModel[] => Object.values(tagsById),
);

export const selectTogglTagRecordsByWorkspaceId = createSelector(
  [
    selectTogglTagRecords,
    (state: State) => state.entities.timeEntries.toggl.timeEntriesById,
  ],
  (tagRecords, timeEntriesById): Record<string, TagModel[]> => {
    const allTagIds: any[] = [];
    Object.values(timeEntriesById).forEach(timeEntryRecord => {
      const tagNames = timeEntryRecord.tags;
      const tagIds = tagNames.reduce((acc, tagName) => {
        const matchingTag = tagRecords.find(
          tagRecord => tagRecord.name === tagName,
        );
        if (!matchingTag) return acc;
        return [...acc, matchingTag.id];
      }, []);
      allTagIds.push(tagIds);
    });

    const entryCountsByTagId = flatten(allTagIds).reduce(
      (acc, tagId) => ({
        ...acc,
        [tagId]: get(acc, tagId, 0) + 1,
      }),
      {},
    );

    const tagRecordsByWorkspaceId = getEntityRecordsByWorkspaceId(
      EntityType.Tag,
      tagRecords,
      timeEntriesById,
    );

    return Object.entries(tagRecordsByWorkspaceId).reduce(
      (acc, [workspaceId, tagRecords]: [string, TagModel[]]) => ({
        ...acc,
        [workspaceId]: tagRecords.map(tagRecord => ({
          ...tagRecord,
          entryCount: get(entryCountsByTagId, tagRecord.id, 0),
        })),
      }),
      {},
    );
  },
);
