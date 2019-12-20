import { createSelector, Selector } from "reselect";
import { get } from "lodash";
import { findTogglInclusions, groupByWorkspace } from "~/utils";
import { EntityGroupsByKey, EntityWithName } from "~/commonTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { CompoundTagModel } from "./tagsTypes";

export const selectTogglTags = createSelector(
  (state: ReduxState) => Object.values(state.tags.toggl.byId),
  (tags): Array<CompoundTagModel> => tags,
);

export const selectTogglTagsByWorkspaceFactory = (
  inclusionsOnly: boolean,
): Selector<ReduxState, EntityGroupsByKey<CompoundTagModel>> =>
  createSelector(selectTogglTags, tags => {
    const tagsToUse = inclusionsOnly ? findTogglInclusions(tags) : tags;
    return groupByWorkspace(tagsToUse);
  });

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
    if (inclusions.length === 0) {
      return [];
    }

    return inclusions.reduce((acc, { workspaceId, name }) => {
      if (workspaceIdToGet !== workspaceId) {
        return acc;
      }
      return [...acc, { name }];
    }, []);
  },
);
