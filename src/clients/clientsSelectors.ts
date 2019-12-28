import { createSelector } from "reselect";
import * as R from "ramda";
import { selectMappingByToolName } from "~/app/appSelectors";
import { selectActiveWorkspaceId } from "~/workspaces/workspacesSelectors";
import { ToolName, Mapping } from "~/entities/entitiesTypes";
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

export const selectIncludedSourceClients = createSelector(
  selectSourceClients,
  (sourceClients): ClientModel[] =>
    sourceClients.filter(sourceClient => sourceClient.isIncluded),
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
  selectIncludedSourceClients,
  (sourceClients): ClientModel[] =>
    sourceClients.filter(sourceClient => R.isNil(sourceClient.linkedId)),
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
  (_: ReduxState, sourceClientId: string | null) => sourceClientId,
  (sourceClientsById, sourceClientId): string | null => {
    if (R.isNil(sourceClientId)) {
      return null;
    }
    return R.pathOr(null, [sourceClientId, "linkedId"], sourceClientsById);
  },
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
