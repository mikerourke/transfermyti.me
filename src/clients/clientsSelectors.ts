import { createSelector, Selector } from "reselect";
import { get, isNil } from "lodash";
import { findTogglInclusions, groupByWorkspace } from "~/utils";
import { EntityGroupsByKey, EntityWithName } from "~/common/commonTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { CompoundClientModel } from "./clientsTypes";

const selectTogglClientsById = createSelector(
  (state: ReduxState) => state.clients.toggl.byId,
  (clientsById): Record<string, CompoundClientModel> => clientsById,
);

export const selectTogglClients = createSelector(
  selectTogglClientsById,
  (clientsById): Array<CompoundClientModel> => Object.values(clientsById),
);

export const selectTogglClientsByWorkspaceFactory = (
  inclusionsOnly: boolean,
): Selector<ReduxState, EntityGroupsByKey<CompoundClientModel>> =>
  createSelector(
    selectTogglClients,
    (clients): EntityGroupsByKey<CompoundClientModel> => {
      const clientsToUse = inclusionsOnly
        ? findTogglInclusions(clients)
        : clients;
      return groupByWorkspace(clientsToUse);
    },
  );

export const selectClientsTransferPayloadForWorkspace = createSelector(
  selectTogglClientsByWorkspaceFactory(true),
  inclusionsByWorkspace => (
    workspaceIdToGet: string,
  ): Array<EntityWithName> => {
    const inclusions = get(
      inclusionsByWorkspace,
      workspaceIdToGet,
      [],
    ) as Array<CompoundClientModel>;
    if (inclusions.length === 0) {
      return [];
    }

    return inclusions.reduce((acc, { name }) => [...acc, { name }], []);
  },
);

export const selectTogglClientMatchingId = createSelector(
  selectTogglClientsById,
  clientsById => (idToMatch: string): Partial<CompoundClientModel> => {
    const matchingClient = get(clientsById, idToMatch, null);

    if (isNil(matchingClient)) {
      return { linkedId: null, isIncluded: false };
    }

    return matchingClient;
  },
);
