import { createSelector } from 'reselect';
import { get } from 'lodash';
import { findTogglInclusions } from '~/redux/utils';
import {
  EntitiesByGroupModel,
  EntityGroup,
  ReduxState,
  ToolName,
} from '~/types';

export const selectEntitiesByGroupFactory = (toolName: ToolName) =>
  createSelector(
    (state: ReduxState) => state.entities,
    (entitiesByEntityGroup): EntitiesByGroupModel =>
      Object.values(EntityGroup).reduce(
        (acc, entityGroup) => ({
          ...acc,
          [entityGroup]: get(
            entitiesByEntityGroup,
            [entityGroup, toolName],
            {},
          ),
        }),
        {},
      ),
  );

export const selectTotalCountOfPendingTransfers = createSelector(
  selectEntitiesByGroupFactory(ToolName.Toggl),
  entitiesByGroup => {
    let totalCount = 0;

    const entityGroupsToInclude = [
      EntityGroup.Projects,
      EntityGroup.Clients,
      EntityGroup.Tags,
      EntityGroup.Tasks,
      EntityGroup.TimeEntries,
    ];

    entityGroupsToInclude.forEach(entityGroup => {
      const { byId } = get(entitiesByGroup, entityGroup, {});
      const includedRecords = findTogglInclusions(Object.values(byId));
      totalCount += includedRecords.length;
    });

    return totalCount;
  },
);
