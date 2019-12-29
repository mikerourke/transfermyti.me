import { createSelector } from "reselect";
import * as R from "ramda";
import { mappingByToolNameSelector } from "~/app/appSelectors";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { ToolName, Mapping } from "~/entities/entitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { ClientModel, ClientsByIdModel } from "./clientsTypes";

const sourceClientsByIdSelector = createSelector(
  (state: ReduxState) => state.clients.source,
  (sourceClientsById): ClientsByIdModel => sourceClientsById,
);

const targetClientsByIdSelector = createSelector(
  (state: ReduxState) => state.clients.target,
  (targetClientsById): ClientsByIdModel => targetClientsById,
);

export const sourceClientsSelector = createSelector(
  sourceClientsByIdSelector,
  (sourceClients): ClientModel[] => Object.values(sourceClients),
);

export const includedSourceClientsSelector = createSelector(
  sourceClientsSelector,
  (sourceClients): ClientModel[] =>
    sourceClients.filter(sourceClient => sourceClient.isIncluded),
);

export const targetClientsSelector = createSelector(
  targetClientsByIdSelector,
  (targetClientsById): ClientModel[] => Object.values(targetClientsById),
);

export const clientsByMappingSelector = createSelector(
  sourceClientsSelector,
  targetClientsSelector,
  (sourceClients, targetClients): Record<Mapping, ClientModel[]> => ({
    source: sourceClients,
    target: targetClients,
  }),
);

export const sourceClientsForTransferSelector = createSelector(
  includedSourceClientsSelector,
  (sourceClients): ClientModel[] =>
    sourceClients.filter(sourceClient => R.isNil(sourceClient.linkedId)),
);

export const sourceClientsInActiveWorkspaceSelector = createSelector(
  sourceClientsSelector,
  activeWorkspaceIdSelector,
  (sourceClients, activeWorkspaceId) =>
    sourceClients.filter(
      sourceClient => sourceClient.workspaceId === activeWorkspaceId,
    ),
);

export const targetClientIdSelector = createSelector(
  sourceClientsByIdSelector,
  (_: ReduxState, sourceClientId: string | null) => sourceClientId,
  (sourceClientsById, sourceClientId): string | null => {
    if (R.isNil(sourceClientId)) {
      return null;
    }
    return R.pathOr(null, [sourceClientId, "linkedId"], sourceClientsById);
  },
);

export const clientIdsByNameForToolSelector = createSelector(
  mappingByToolNameSelector,
  clientsByMappingSelector,
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
