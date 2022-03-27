import { lensPath, not, over } from "ramda";
import { type ActionType, createReducer } from "typesafe-actions";

import { updateAreAllRecordsIncluded } from "~/entityOperations/updateAreAllRecordsIncluded";
import { allEntitiesFlushed } from "~/modules/allEntities/allEntitiesActions";
import * as clientsActions from "~/modules/clients/clientsActions";
import { type Client, Mapping } from "~/typeDefs";

type ClientsAction = ActionType<
  typeof clientsActions | typeof allEntitiesFlushed
>;

export interface ClientsState {
  readonly source: Dictionary<Client>;
  readonly target: Dictionary<Client>;
  readonly isFetching: boolean;
}

export const initialState: ClientsState = {
  source: {},
  target: {},
  isFetching: false,
};

export const clientsReducer = createReducer<ClientsState, ClientsAction>(
  initialState,
)
  .handleAction(
    [clientsActions.createClients.success, clientsActions.fetchClients.success],
    (state, { payload }) => ({
      ...state,
      source: {
        ...state.source,
        ...payload.source,
      },
      target: {
        ...state.target,
        ...payload.target,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      clientsActions.createClients.request,
      clientsActions.deleteClients.request,
      clientsActions.fetchClients.request,
    ],
    (state) => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      clientsActions.createClients.failure,
      clientsActions.deleteClients.failure,
      clientsActions.fetchClients.failure,
    ],
    (state) => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(clientsActions.isClientIncludedToggled, (state, { payload }) =>
    over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
  )
  .handleAction(
    clientsActions.areAllClientsIncludedUpdated,
    (state, { payload }) => ({
      ...state,
      source: updateAreAllRecordsIncluded(state.source, payload),
    }),
  )
  .handleAction(
    [clientsActions.deleteClients.success, allEntitiesFlushed],
    () => ({ ...initialState }),
  );
