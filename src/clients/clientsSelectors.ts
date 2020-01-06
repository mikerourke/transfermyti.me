import { createSelector, createStructuredSelector, Selector } from "reselect";
import * as R from "ramda";
import { mappingByToolNameSelector } from "~/app/appSelectors";
import { sourceTimeEntryCountByIdFieldSelectorFactory } from "~/timeEntries/timeEntriesSelectors";
import { activeWorkspaceIdSelector } from "~/workspaces/workspacesSelectors";
import { ToolName, Mapping } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import {
  ClientModel,
  ClientsByIdModel,
  ClientTableViewModel,
} from "./clientsTypes";

export const sourceClientsByIdSelector = createSelector(
  (state: ReduxState) => state.clients.source,
  (sourceClientsById): ClientsByIdModel => sourceClientsById,
);

const targetClientsByIdSelector = createSelector(
  (state: ReduxState) => state.clients.target,
  (targetClientsById): ClientsByIdModel => targetClientsById,
);

const sourceClientsSelector = createSelector(
  sourceClientsByIdSelector,
  (sourceClients): ClientModel[] => Object.values(sourceClients),
);

const targetClientsSelector = createSelector(
  targetClientsByIdSelector,
  (targetClientsById): ClientModel[] => Object.values(targetClientsById),
);

export const includedSourceClientsSelector = createSelector(
  sourceClientsSelector,
  (sourceClients): ClientModel[] =>
    sourceClients.filter(sourceClient => sourceClient.isIncluded),
);

const clientsByMappingSelector = createStructuredSelector<
  ReduxState,
  Record<Mapping, ClientModel[]>
>({
  source: sourceClientsSelector,
  target: targetClientsSelector,
});

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

const projectCountBySourceClientIdSelector = createSelector(
  sourceClientsSelector,
  sourceClients => {
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
  ): ClientTableViewModel[] =>
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
    }, [] as ClientTableViewModel[]),
);

export const clientsTotalCountsByTypeSelector = createSelector(
  clientsForInclusionsTableSelector,
  clientsForTableView =>
    clientsForTableView.reduce(
      (
        acc,
        { entryCount, projectCount, isIncluded }: ClientTableViewModel,
      ) => ({
        entries: acc.entries + entryCount,
        inProject: acc.inProject + projectCount,
        inclusions: acc.inclusions + (isIncluded ? 1 : 0),
      }),
      {
        entries: 0,
        inProject: 0,
        inclusions: 0,
      },
    ),
);

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
