import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";
import { updateAreAllRecordsIncluded } from "~/redux/reduxUtils";
import { flushAllEntities } from "~/allEntities/allEntitiesActions";
import * as clientsActions from "./clientsActions";
import { Mapping } from "~/allEntities/allEntitiesTypes";
import { ClientsByIdModel } from "./clientsTypes";

type ClientsAction = ActionType<
  typeof clientsActions | typeof flushAllEntities
>;

export interface ClientsState {
  readonly source: ClientsByIdModel;
  readonly target: ClientsByIdModel;
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
    state => ({
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
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(clientsActions.flipIsClientIncluded, (state, { payload }) =>
    R.over(R.lensPath([Mapping.Source, payload, "isIncluded"]), R.not, state),
  )
  .handleAction(
    clientsActions.updateAreAllClientsIncluded,
    (state, { payload }) => ({
      ...state,
      source: updateAreAllRecordsIncluded(state.source, payload),
    }),
  )
  .handleAction(
    [clientsActions.deleteClients.success, flushAllEntities],
    () => ({ ...initialState }),
  );
