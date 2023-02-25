import { lensPath, not, over } from "ramda";

import { updateAreAllRecordsIncluded } from "~/entityOperations/updateAreAllRecordsIncluded";
import { allEntitiesFlushed } from "~/modules/allEntities/allEntitiesActions";
import {
  createReducer,
  isActionOf,
  type AnyAction,
  type ActionType,
} from "~/redux/reduxTools";
import { Mapping, type Client } from "~/typeDefs";

import * as clientsActions from "./clientsActions";

export interface ClientsState {
  readonly source: Dictionary<Client>;
  readonly target: Dictionary<Client>;
  readonly isFetching: boolean;
}

export const clientsInitialState: ClientsState = {
  source: {},
  target: {},
  isFetching: false,
};

export const clientsReducer = createReducer<ClientsState>(
  clientsInitialState,
  (builder) => {
    builder
      .addCase(
        clientsActions.areAllClientsIncludedUpdated,
        (state, { payload }) => ({
          ...state,
          source: updateAreAllRecordsIncluded(state.source, payload),
        }),
      )
      .addCase(clientsActions.isClientIncludedToggled, (state, { payload }) =>
        over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
      )
      .addMatcher(isClientsApiSuccessAction, (state, { payload }) => ({
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
      }))
      .addMatcher(isClientsApiRequestAction, (state) => {
        state.isFetching = true;
      })
      .addMatcher(isClientsApiFailureAction, (state) => {
        state.isFetching = false;
      })
      .addMatcher(isResetClientsStateAction, () => ({
        ...clientsInitialState,
      }));
  },
);

type ClientsCreateOrFetchSuccessAction = ActionType<
  | typeof clientsActions.createClients.success
  | typeof clientsActions.fetchClients.success
>;

function isClientsApiSuccessAction(
  action: AnyAction,
): action is ClientsCreateOrFetchSuccessAction {
  return isActionOf(
    [clientsActions.createClients.success, clientsActions.fetchClients.success],
    action,
  );
}

type ClientsApiRequestAction = ActionType<
  | typeof clientsActions.createClients.request
  | typeof clientsActions.deleteClients.request
  | typeof clientsActions.fetchClients.request
>;

function isClientsApiRequestAction(
  action: AnyAction,
): action is ClientsApiRequestAction {
  return isActionOf(
    [
      clientsActions.createClients.request,
      clientsActions.deleteClients.request,
      clientsActions.fetchClients.request,
    ],
    action,
  );
}

type ClientsApiFailureAction = ActionType<
  | typeof clientsActions.createClients.failure
  | typeof clientsActions.deleteClients.failure
  | typeof clientsActions.fetchClients.failure
>;

function isClientsApiFailureAction(
  action: AnyAction,
): action is ClientsApiFailureAction {
  return isActionOf(
    [
      clientsActions.createClients.failure,
      clientsActions.deleteClients.failure,
      clientsActions.fetchClients.failure,
    ],
    action,
  );
}

type ResetClientsStateAction = ActionType<
  typeof clientsActions.deleteClients.success | typeof allEntitiesFlushed
>;

function isResetClientsStateAction(
  action: AnyAction,
): action is ResetClientsStateAction {
  return isActionOf(
    [clientsActions.deleteClients.success, allEntitiesFlushed],
    action,
  );
}
