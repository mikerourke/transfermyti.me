import { createSelector } from 'reselect';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import { getEntityRecordsByWorkspaceId } from '../../utils';
import {
  CreateNamedEntityRequest,
  EntityType,
} from '../../../types/commonTypes';
import { TagModel } from '../../../types/tagsTypes';
import { TimeEntryModel } from '../../../types/timeEntriesTypes';
import { State } from '../../rootReducer';

export const selectClockifyTagsById = createSelector(
  (state: State) => state.entities.tags.clockify.byId,
  tagsById => tagsById,
);

export const selectTogglTagsById = createSelector(
  (state: State) => state.entities.tags.toggl.byId,
  tagsById => tagsById,
);

export const selectTogglTagRecords = createSelector(
  (state: State) => state.entities.tags.toggl.byId,
  (tagsById): TagModel[] => Object.values(tagsById),
);

const getTagIdsByName = (
  tagsById: Record<string, TagModel>,
): Record<string, string> =>
  Object.values(tagsById).reduce(
    (acc, { id, name }) => ({ ...acc, [name]: id.toString() }),
    {},
  );

export const selectClockifyTagIdsByName = createSelector(
  selectClockifyTagsById,
  (tagsById): Record<string, string> => getTagIdsByName(tagsById),
);

export const selectTogglTagIdsByName = createSelector(
  selectTogglTagsById,
  (tagsById): Record<string, string> => getTagIdsByName(tagsById),
);

const getTagRecordsByWorkspaceId = (
  tagRecords: TagModel[],
  timeEntriesById: Record<string, TimeEntryModel>,
  inclusionsOnly: boolean,
): Record<string, TagModel[]> => {
  const allTagIds: any[] = [];

  Object.values(timeEntriesById).forEach(timeEntryRecord => {
    const tagNames = timeEntryRecord.tags;

    if (tagNames.length > 0) {
      const tagIds = tagNames.reduce((acc, tagName) => {
        const matchingTag = tagRecords.find(
          tagRecord => tagRecord.name === tagName,
        );
        if (!matchingTag) return acc;
        return [...acc, matchingTag.id];
      }, []);

      allTagIds.push(tagIds);
    }
  });

  const flattenedTagList = flatten(allTagIds);
  let entryCountsByTagId = {};

  if (flattenedTagList.length > 0) {
    entryCountsByTagId = flatten(allTagIds).reduce(
      (acc, tagId) => ({
        ...acc,
        [tagId]: get(acc, tagId, 0) + 1,
      }),
      {},
    );
  }

  const tagRecordsByWorkspaceId = getEntityRecordsByWorkspaceId(
    EntityType.Tag,
    tagRecords,
    timeEntriesById,
    inclusionsOnly,
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
};

export const selectTogglTagsByWorkspaceId = createSelector(
  [
    selectTogglTagRecords,
    (state: State) => state.entities.timeEntries.toggl.byId,
  ],
  (tagRecords, timeEntriesById): Record<string, TagModel[]> =>
    getTagRecordsByWorkspaceId(tagRecords, timeEntriesById, false),
);

export const selectTogglTagInclusionsByWorkspaceId = createSelector(
  [
    selectTogglTagRecords,
    (state: State) => state.entities.timeEntries.toggl.byId,
  ],
  (tagRecords, timeEntriesById): Record<string, TagModel[]> =>
    getTagRecordsByWorkspaceId(tagRecords, timeEntriesById, true),
);

export const selectTagsTransferPayloadForWorkspace = createSelector(
  [
    selectTogglTagInclusionsByWorkspaceId,
    (_: null, workspaceId: string) => workspaceId,
  ],
  (inclusionsByWorkspaceId, workspaceIdToGet): CreateNamedEntityRequest[] => {
    const includedRecords = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as TagModel[];
    if (includedRecords.length === 0) return [];

    return includedRecords.reduce((acc, { workspaceId, name }) => {
      if (workspaceId !== workspaceIdToGet) return acc;
      return [...acc, { name }];
    }, []);
  },
);
