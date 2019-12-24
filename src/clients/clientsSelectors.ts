import { createSelector } from "reselect";
import { ReduxState } from "~/redux/reduxTypes";
import { ClientModel } from "./clientsTypes";

const selectTargetClientsById = createSelector(
  (state: ReduxState) => state.clients.target,
  (clientsById): Record<string, ClientModel> => clientsById,
);

export const selectTargetClients = createSelector(
  selectTargetClientsById,
  (clientsById): ClientModel[] => Object.values(clientsById),
);

export const selectTargetClientsInWorkspace = createSelector(
  selectTargetClients,
  (_: unknown, workspaceId: string) => workspaceId,
  (targetClients, workspaceId): ClientModel[] =>
    targetClients.filter(client => client.workspaceId === workspaceId),
);

export const selectTargetClientsForTransfer = createSelector(
  selectTargetClientsInWorkspace,
  (targetClients): ClientModel[] =>
    targetClients.filter(client => client.isIncluded),
);
