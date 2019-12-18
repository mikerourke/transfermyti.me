import { createSelector, Selector } from "reselect";
import { get } from "lodash";
import {
  EntitiesByGroupModel,
  EntityGroup,
  ReduxState,
  ToolName,
} from "~/types";

export const selectEntitiesByGroupFactory = (
  toolName: ToolName,
): Selector<ReduxState, EntitiesByGroupModel> =>
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
        {} as EntitiesByGroupModel,
      ),
  );
