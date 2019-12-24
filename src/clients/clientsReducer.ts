import { createReducer, ActionType } from "typesafe-actions";
import R from "ramda";
import * as clientsActions from "./clientsActions";
import { ClientModel } from "./clientsTypes";

type ClientsAction = ActionType<typeof clientsActions>;

export interface ClientsState {
  readonly source: Record<string, ClientModel>;
  readonly target: Record<string, ClientModel>;
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
    [
      clientsActions.fetchClockifyClients.success,
      clientsActions.fetchTogglClients.success,
    ],
    (state, { payload }) => ({
      ...state,
      [payload.mapping]: {
        ...state[payload.mapping],
        ...payload.recordsById,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      clientsActions.createClockifyClients.request,
      clientsActions.createTogglClients.request,
      clientsActions.fetchClockifyClients.request,
      clientsActions.fetchTogglClients.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      clientsActions.createClockifyClients.success,
      clientsActions.createTogglClients.success,
      clientsActions.createClockifyClients.failure,
      clientsActions.createTogglClients.failure,
      clientsActions.fetchClockifyClients.failure,
      clientsActions.fetchTogglClients.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(clientsActions.flipIsClientIncluded, (state, { payload }) =>
    R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
