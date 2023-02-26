import { isNil, propOr } from "ramda";

import { selectIdToLinkedId } from "~/entityOperations/selectIdToLinkedId";
import { mappingByToolNameSelector } from "~/redux/allEntities/allEntitiesSelectors";
import { createSelector, type Selector } from "~/redux/reduxTools";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/redux/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/redux/workspaces/workspacesSelectors";
import type {
  Client,
  ClientTableRecord,
  Mapping,
  ReduxState,
  ToolName,
} from "~/typeDefs";

export const sourceClientsByIdSelector = createSelector(
  (state: ReduxState) => state.clients.source,
  (sourceClientsById): Dictionary<Client> => sourceClientsById,
);

const targetClientsByIdSelector = createSelector(
  (state: ReduxState) => state.clients.target,
  (targetClientsById): Dictionary<Client> => targetClientsById,
);

const sourceClientsSelector = createSelector(
  sourceClientsByIdSelector,
  (sourceClients): Client[] => Object.values(sourceClients),
);

const targetClientsSelector = createSelector(
  targetClientsByIdSelector,
  (targetClientsById): Client[] => Object.values(targetClientsById),
);

export const includedSourceClientsSelector = createSelector(
  sourceClientsSelector,
  (sourceClients): Client[] =>
    sourceClients.filter((sourceClient) => sourceClient.isIncluded),
);

export const sourceClientsForTransferSelector = createSelector(
  includedSourceClientsSelector,
  (sourceClients): Client[] =>
    sourceClients.filter((sourceClient) => isNil(sourceClient.linkedId)),
);

export const sourceClientsInActiveWorkspaceSelector = createSelector(
  sourceClientsSelector,
  activeWorkspaceIdSelector,
  (sourceClients, activeWorkspaceId): Client[] =>
    sourceClients.filter(
      (sourceClient) => sourceClient.workspaceId === activeWorkspaceId,
    ),
);

export const clientIdToLinkedIdSelector = createSelector(
  sourceClientsByIdSelector,
  (sourceClientsById): Dictionary<string> =>
    selectIdToLinkedId(sourceClientsById),
);

const projectCountBySourceClientIdSelector = createSelector(
  sourceClientsSelector,
  (sourceClients): Dictionary<number> => {
    const projectCountBySourceClientId: Dictionary<number> = {};

    for (const sourceClient of sourceClients) {
      const currentCount = propOr<number, Dictionary<number>, number>(
        0,
        sourceClient.id,
        projectCountBySourceClientId,
      );

      projectCountBySourceClientId[sourceClient.id] = currentCount + 1;
    }

    return projectCountBySourceClientId;
  },
);

export const clientsForInclusionsTableSelector = createSelector(
  (state: ReduxState) => state.allEntities.areExistsInTargetShown,
  sourceClientsInActiveWorkspaceSelector,
  projectCountBySourceClientIdSelector,
  sourceTimeEntryCountByIdFieldSelectorFactory("clientId"),
  (
    areExistsInTargetShown,
    sourceClients,
    projectCountByClientId,
    timeEntryCountByClientId,
  ): ClientTableRecord[] => {
    const clientTableRecords: ClientTableRecord[] = [];

    for (const sourceClient of sourceClients) {
      const existsInTarget = sourceClient.linkedId !== null;

      if (existsInTarget && !areExistsInTargetShown) {
        continue;
      }

      const entryCount = propOr<number, Dictionary<number>, number>(
        0,
        sourceClient.id,
        timeEntryCountByClientId,
      );

      const projectCount = propOr<number, Dictionary<number>, number>(
        0,
        sourceClient.id,
        projectCountByClientId,
      );

      clientTableRecords.push({
        ...sourceClient,
        entryCount,
        projectCount,
        existsInTarget,
        isActiveInSource: true,
        isActiveInTarget: existsInTarget,
      });
    }

    return clientTableRecords;
  },
);

export const clientsTotalCountsByTypeSelector = createSelector(
  clientsForInclusionsTableSelector,
  (clientsForInclusionsTable): Dictionary<number> =>
    clientsForInclusionsTable.reduce(
      (
        acc,
        {
          entryCount,
          existsInTarget,
          projectCount,
          isIncluded,
        }: ClientTableRecord,
      ) => ({
        entryCount: acc.entryCount + entryCount,
        existsInTarget: acc.existsInTarget + (existsInTarget ? 1 : 0),
        projectCount: acc.projectCount + projectCount,
        isIncluded: acc.isIncluded + (isIncluded ? 1 : 0),
      }),
      {
        entryCount: 0,
        existsInTarget: 0,
        projectCount: 0,
        isIncluded: 0,
      },
    ),
);

const clientsByMappingSelector = createSelector(
  sourceClientsSelector,
  targetClientsSelector,
  (sourceClients, targetClients): Record<Mapping, Client[]> => ({
    source: sourceClients,
    target: targetClients,
  }),
);

export const clientIdsByNameSelectorFactory = (
  toolName: ToolName,
): Selector<ReduxState, Dictionary<string>> =>
  createSelector(
    mappingByToolNameSelector,
    clientsByMappingSelector,
    (mappingByToolName, clientsByMapping) => {
      const toolMapping = mappingByToolName[toolName];

      const clients = clientsByMapping[toolMapping];

      const clientIdsByName: Dictionary<string> = {};
      for (const client of clients) {
        clientIdsByName[client.name] = client.id;
      }

      return clientIdsByName;
    },
  );
