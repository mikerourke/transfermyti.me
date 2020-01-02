import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import {
  EntityGroup,
  TransferCountsByEntityGroupModel,
} from "./allEntitiesTypes";

export const areEntitiesCreatingSelector = (state: ReduxState): boolean =>
  state.allEntities.areEntitiesCreating;

export const areEntitiesFetchingSelector = (state: ReduxState): boolean =>
  state.allEntities.areEntitiesFetching;

export const entityGroupInProcessDisplaySelector = createSelector(
  (state: ReduxState) => state.allEntities.entityGroupInProcess,
  (entityGroupInProcess): string => {
    if (entityGroupInProcess === null) {
      return "None";
    }

    switch (entityGroupInProcess) {
      case EntityGroup.TimeEntries:
        return "time entries";

      case EntityGroup.UserGroups:
        return "user groups";

      default:
        return entityGroupInProcess as string;
    }
  },
);

export const transferCountsByEntityGroupSelector = createSelector(
  (state: ReduxState) => state.allEntities.transferCountsByEntityGroup,
  (transferCountsByEntityGroup): TransferCountsByEntityGroupModel =>
    transferCountsByEntityGroup,
);
