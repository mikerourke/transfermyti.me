import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import {
  CompoundTagModel,
  CreateNamedEntityRequest,
  ReduxState,
} from '~/types';

export const selectTogglTagsById = createSelector(
  (state: ReduxState) => state.entities.tags.toggl.byId,
  (tagsById): Record<string, CompoundTagModel> => tagsById,
);

export const selectTogglTags = createSelector(
  selectTogglTagsById,
  (tagsById): Array<CompoundTagModel> => Object.values(tagsById),
);

export const selectTogglTagsByWorkspaceFactory = (inclusionsOnly: boolean) =>
  createSelector(
    selectTogglTags,
    tags => {
      const tagsToUse = inclusionsOnly ? findTogglInclusions(tags) : tags;
      return groupByWorkspace(tagsToUse);
    },
  );

export const selectTagsTransferPayloadForWorkspace = createSelector(
  selectTogglTagsByWorkspaceFactory(true),
  inclusionsByWorkspaceId => (
    workspaceIdToGet: string,
  ): Array<CreateNamedEntityRequest> => {
    const inclusions = get(
      inclusionsByWorkspaceId,
      workspaceIdToGet,
      [],
    ) as Array<CompoundTagModel>;
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { workspaceId, name }) => {
      if (workspaceIdToGet !== workspaceId) return acc;
      return [...acc, { name }];
    }, []);
  },
);
