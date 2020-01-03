import { createSelector } from "reselect";
import { getEntityGroupDisplay } from "~/utils";
import { ReduxState } from "~/redux/reduxTypes";
import { TransferCountsByEntityGroupModel } from "./allEntitiesTypes";

export const areEntitiesCreatingSelector = (state: ReduxState): boolean =>
  state.allEntities.areEntitiesCreating;

export const areEntitiesFetchingSelector = (state: ReduxState): boolean =>
  state.allEntities.areEntitiesFetching;

export const areExistsInTargetShownSelector = (state: ReduxState): boolean =>
  state.allEntities.areExistsInTargetShown;

export const entityGroupInProcessDisplaySelector = createSelector(
  (state: ReduxState) => state.allEntities.entityGroupInProcess,
  (entityGroupInProcess): string =>
    getEntityGroupDisplay(entityGroupInProcess).toLowerCase(),
);

export const transferCountsByEntityGroupSelector = createSelector(
  (state: ReduxState) => state.allEntities.transferCountsByEntityGroup,
  (transferCountsByEntityGroup): TransferCountsByEntityGroupModel =>
    transferCountsByEntityGroup,
);
