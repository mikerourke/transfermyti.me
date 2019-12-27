import { createSelector } from "reselect";
import * as R from "ramda";
import { selectMappingByToolName } from "~/app/appSelectors";
import { ToolName, Mapping } from "~/common/commonTypes";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ReduxState } from "~/redux/reduxTypes";
import { ClientModel, ClientsByIdModel } from "./clientsTypes";

const selectSourceClientsById = createSelector(
  (state: ReduxState) => state.clients.source,
  (sourceClientsById): ClientsByIdModel => sourceClientsById,
);

const selectTargetClientsById = createSelector(
  (state: ReduxState) => state.clients.target,
  (targetClientsById): ClientsByIdModel => targetClientsById,
);

export const selectSourceClients = createSelector(
  selectSourceClientsById,
  (sourceClients): ClientModel[] => Object.values(sourceClients),
);

export const selectTargetClients = createSelector(
  selectTargetClientsById,
  (targetClientsById): ClientModel[] => Object.values(targetClientsById),
);

export const selectClientsByMapping = createSelector(
  selectSourceClients,
  selectTargetClients,
  (sourceClients, targetClients): Record<Mapping, ClientModel[]> => ({
    source: sourceClients,
    target: targetClients,
  }),
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

export const selectTargetClientId = createSelector(
  selectSourceClientsById,
  (_: ReduxState, sourceClientId: string) => sourceClientId,
  (sourceClientsById, sourceClientId): string | null =>
    R.pathOr(null, [sourceClientId, "linkedId"], sourceClientsById),
);

export const selectClientIdsByNameForTool = createSelector(
  selectMappingByToolName,
  selectClientsByMapping,
  (_: ReduxState, toolName: ToolName) => toolName,
  (mappingByToolName, clientsByMapping, toolName) => {
    const toolMapping = mappingByToolName[toolName];
    const clients = clientsByMapping[toolMapping];

    const clientIdsByName: Record<string, string> = {};
    for (const client of clients) {
      clientIdsByName[client.name] = client.id;
    }

    return clientIdsByName;
  },
);
