import { createReducer, ActionType } from "typesafe-actions";
import * as R from "ramda";
import * as clientsActions from "./clientsActions";
import { ClientsByIdModel } from "./clientsTypes";

type ClientsAction = ActionType<typeof clientsActions>;

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
      ...payload,
      isFetching: false,
    }),
  )
  .handleAction(
    [clientsActions.createClients.request, clientsActions.fetchClients.request],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [clientsActions.createClients.failure, clientsActions.fetchClients.failure],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(clientsActions.pushUpdatesToClients, (state, { payload }) => ({
    ...state,
    ...payload,
  }))
  .handleAction(clientsActions.flipIsClientIncluded, (state, { payload }) =>
    R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
