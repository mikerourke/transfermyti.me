import { createSelector } from "reselect";
import * as R from "ramda";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { ClientModel } from "./clientsTypes";

export const selectSourceClients = createSelector(
  (state: ReduxState) => state.clients.source,
  (clientsById): ClientModel[] => Object.values(clientsById),
);

export const selectSourceClientsForTransfer = createSelector(
  selectSourceClients,
  (sourceClients): ClientModel[] =>
    sourceClients.filter(sourceClient =>
      R.and(sourceClient.isIncluded, R.isNil(sourceClient.linkedId)),
    ),
);

export const selectSourceClientsInActiveWorkspace = createSelector(
  selectSourceClients,
  selectActiveWorkspaceId,
  (sourceClients, activeWorkspaceId) =>
    sourceClients.filter(
      sourceClient => sourceClient.workspaceId === activeWorkspaceId,
    ),
);
