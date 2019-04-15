import { createSelector } from 'reselect';
import { get } from 'lodash';
import {
  EntitiesByGroupModel,
  ReduxState,
  ToolName,
} from '~/types/commonTypes';
import { EntityGroup } from '~/types/entityTypes';

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
