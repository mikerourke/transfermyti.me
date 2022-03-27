import * as R from "ramda";
import { createSelector, createStructuredSelector, Selector } from "reselect";

import { selectIdToLinkedId } from "~/entityOperations/selectIdToLinkedId";
import { mappingByToolNameSelector } from "~/modules/allEntities/allEntitiesSelectors";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/modules/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/modules/workspaces/workspacesSelectors";
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
    sourceClients.filter((sourceClient) => R.isNil(sourceClient.linkedId)),
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
  (sourceClientsById): Record<string, string> =>
    selectIdToLinkedId(sourceClientsById),
);

const projectCountBySourceClientIdSelector = createSelector(
  sourceClientsSelector,
  (sourceClients): Record<string, number> => {
    const projectCountBySourceClientId: Record<string, number> = {};

    for (const sourceClient of sourceClients) {
      const currentCount = R.propOr<number, Record<string, number>, number>(
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
  ): ClientTableRecord[] =>
    sourceClients.reduce((acc, sourceClient) => {
      const existsInTarget = sourceClient.linkedId !== null;
      if (existsInTarget && !areExistsInTargetShown) {
        return acc;
      }

      const entryCount = R.propOr<number, Record<string, number>, number>(
        0,
        sourceClient.id,
        timeEntryCountByClientId,
      );
      const projectCount = R.propOr<number, Record<string, number>, number>(
        0,
        sourceClient.id,
        projectCountByClientId,
      );

      return [
        ...acc,
        {
          ...sourceClient,
          entryCount,
          projectCount,
          existsInTarget,
          isActiveInSource: true,
          isActiveInTarget: existsInTarget,
        },
      ];
    }, [] as ClientTableRecord[]),
);

export const clientsTotalCountsByTypeSelector = createSelector(
  clientsForInclusionsTableSelector,
  (clientsForInclusionsTable): Record<string, number> =>
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

const clientsByMappingSelector = createStructuredSelector<
  ReduxState,
  Record<Mapping, Client[]>
>({
  source: sourceClientsSelector,
  target: targetClientsSelector,
});

export const clientIdsByNameSelectorFactory = (
  toolName: ToolName,
): Selector<ReduxState, Record<string, string>> =>
  createSelector(
    mappingByToolNameSelector,
    clientsByMappingSelector,
    (mappingByToolName, clientsByMapping) => {
      const toolMapping = mappingByToolName[toolName];
      const clients = clientsByMapping[toolMapping];

      const clientIdsByName: Record<string, string> = {};
      for (const client of clients) {
        clientIdsByName[client.name] = client.id;
      }

      return clientIdsByName;
    },
  );
