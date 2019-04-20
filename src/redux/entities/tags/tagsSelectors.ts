import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { CompoundTagModel, EntityWithName, ReduxState } from '~/types';

export const selectTogglTags = createSelector(
  (state: ReduxState) => Object.values(state.entities.tags.toggl.byId),
  (tags): Array<CompoundTagModel> => tags,
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
  inclusionsByWorkspace => (
    workspaceIdToGet: string,
  ): Array<EntityWithName> => {
    const inclusions = get(
      inclusionsByWorkspace,
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
