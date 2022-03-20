import cases from "jest-in-case";
import * as R from "ramda";

import * as clientsActions from "~/modules/clients/clientsActions";
import { state, invalidAction } from "~/redux/__mocks__/mockStoreWithState";

import { clientsReducer, initialState } from "../clientsReducer";

const TEST_CLIENTS_STATE = { ...state.clients };

const TEST_CLIENT_ID = "3001";

const TEST_PAYLOAD = {
  source: { ...TEST_CLIENTS_STATE.source },
  target: { ...TEST_CLIENTS_STATE.target },
};

describe("within clientsReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = clientsReducer(initialState, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = clientsReducer(undefined as any, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  cases(
    "the isFetching is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...TEST_CLIENTS_STATE,
        isFetching: options.initialStatus,
      };
      const result = clientsReducer(updatedState, options.action);

      expect(result.isFetching).toEqual(options.expectedStatus);
    },
    [
      {
        name: "when the createClients.success action is dispatched",
        initialStatus: true,
        action: clientsActions.createClients.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchClients.success action is dispatched",
        initialStatus: true,
        action: clientsActions.fetchClients.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the createClients.request action is dispatched",
        initialStatus: false,
        action: clientsActions.createClients.request(),
        expectedStatus: true,
      },
      {
        name: "when the deleteClients.request action is dispatched",
        initialStatus: false,
        action: clientsActions.deleteClients.request(),
        expectedStatus: true,
      },
      {
        name: "when the fetchClients.request action is dispatched",
        initialStatus: false,
        action: clientsActions.fetchClients.request(),
        expectedStatus: true,
      },
      {
        name: "when the createClients.failure action is dispatched",
        initialStatus: true,
        action: clientsActions.createClients.failure(),
        expectedStatus: false,
      },
      {
        name: "when the deleteClients.failure action is dispatched",
        initialStatus: true,
        action: clientsActions.deleteClients.failure(),
        expectedStatus: false,
      },
      {
        name: "when the fetchClients.failure action is dispatched",
        initialStatus: true,
        action: clientsActions.fetchClients.failure(),
        expectedStatus: false,
      },
    ],
  );

  test(`the flipIsClientIncluded action flips the "isIncluded" value of the client with id = payload`, () => {
    const updatedState = R.set(
      R.lensProp("source"),
      {
        [TEST_CLIENT_ID]: {
          ...TEST_CLIENTS_STATE.source[TEST_CLIENT_ID],
          isIncluded: false,
        },
      },
      TEST_CLIENTS_STATE,
    );
    const result = clientsReducer(
      updatedState,
      clientsActions.flipIsClientIncluded(TEST_CLIENT_ID),
    );

    expect(result.source[TEST_CLIENT_ID].isIncluded).toBe(true);
  });

  test(`the updateAreAllClientsIncluded action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...TEST_CLIENTS_STATE,
      source: {
        "3001": {
          id: "3001",
          name: "Test Client A",
          workspaceId: "1001",
          entryCount: 3,
          linkedId: null,
          isIncluded: false,
          memberOf: "clients",
        },
        "3002": {
          id: "3002",
          name: "Test Client B",
          workspaceId: "1001",
          entryCount: 3,
          linkedId: null,
          isIncluded: false,
          memberOf: "clients",
        },
      },
      target: {},
    };
    const result = clientsReducer(updatedState, clientsActions.updateAreAllClientsIncluded(true));

    expect(result.source["3001"].isIncluded).toEqual(true);
    expect(result.source["3002"].isIncluded).toEqual(true);
  });

  test("the deleteClients.success action resets state to initial state", () => {
    const result = clientsReducer(state, clientsActions.deleteClients.success());

    expect(result).toEqual(initialState);
  });
});
