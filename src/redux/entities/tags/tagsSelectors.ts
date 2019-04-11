import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions, groupByWorkspace } from '~/redux/utils';
import { CreateNamedEntityRequest, ReduxState } from '~/types/commonTypes';
import { TagModel } from '~/types/tagsTypes';

export const selectClockifyTagsByWorkspace = createSelector(
  (state: ReduxState) => Object.values(state.entities.tags.clockify.byId),
  tags => groupByWorkspace(tags),
);

export const selectTogglTags = createSelector(
  (state: ReduxState) => state.entities.tags.toggl.byId,
  (tagsById): Array<TagModel> => Object.values(tagsById),
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
    ) as Array<TagModel>;
    if (inclusions.length === 0) return [];

    return inclusions.reduce((acc, { workspaceId, name }) => {
      if (workspaceIdToGet !== workspaceId) return acc;
      return [...acc, { name }];
    }, []);
  },
);
