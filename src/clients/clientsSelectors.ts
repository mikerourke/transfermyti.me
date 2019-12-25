import { createSelector } from "reselect";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { ClientModel } from "./clientsTypes";

export const selectIfClientsFetching = (state: ReduxState): boolean =>
  state.clients.isFetching;

export const selectSourceClients = createSelector(
  (state: ReduxState) => state.clients.source,
  (clientsById): ClientModel[] => Object.values(clientsById),
);

const filterClientsByWorkspaceId = (
  clients: ClientModel[],
  workspaceId: string,
): ClientModel[] =>
  clients.filter(client => client.workspaceId === workspaceId);

export const selectSourceClientsForTransfer = createSelector(
  selectSourceClients,
  (sourceClients): ClientModel[] =>
    sourceClients.filter(client => client.isIncluded),
);

export const selectSourceClientsInActiveWorkspace = createSelector(
  selectSourceClients,
  selectActiveWorkspaceId,
  (sourceClients, activeWorkspaceId) =>
    filterClientsByWorkspaceId(sourceClients, activeWorkspaceId),
);
