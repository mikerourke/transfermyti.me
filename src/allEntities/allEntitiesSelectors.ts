import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { capitalize } from "~/utils";
import { EntityGroup } from "./allEntitiesTypes";

export const areEntitiesFetchingSelector = (state: ReduxState): boolean =>
  state.allEntities.areEntitiesFetching;

export const lastFetchTimeSelector = (state: ReduxState): Date | null =>
  state.allEntities.lastFetchTime;

export const entityGroupInProcessDisplaySelector = createSelector(
  (state: ReduxState) => state.allEntities.entityGroupInProcess,
  (entityGroupInProcess): string => {
    if (entityGroupInProcess === null) {
      return "None";
    }

    switch (entityGroupInProcess) {
      case EntityGroup.TimeEntries:
        return "Time Entries";

      case EntityGroup.UserGroups:
        return "User Groups";

      default:
        return capitalize(entityGroupInProcess as string);
    }
  },
);
