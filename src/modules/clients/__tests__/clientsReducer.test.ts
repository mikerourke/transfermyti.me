import { lensProp, set } from "ramda";
import { describe, test } from "vitest";

import * as clientsActions from "~/modules/clients/clientsActions";
import { FAKES } from "~/testUtilities";

import { clientsReducer, initialState } from "../clientsReducer";

const { INVALID_ACTION, REDUX_STATE, TOGGL_CLIENT, TOGGL_CLIENT_ID } = FAKES;

const MOCK_PAYLOAD = {
  source: { ...REDUX_STATE.clients.source },
  target: { ...REDUX_STATE.clients.target },
};

describe("within clientsReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = clientsReducer(initialState, INVALID_ACTION);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = clientsReducer(undefined, INVALID_ACTION);

    expect(result).toEqual(initialState);
  });

  describe("the isFetching is set to the correct value based on the dispatched action", () => {
    const testCases = [
      {
        name: "when the createClients.success action is dispatched",
        initialStatus: true,
        action: clientsActions.createClients.success(MOCK_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchClients.success action is dispatched",
        initialStatus: true,
        action: clientsActions.fetchClients.success(MOCK_PAYLOAD),
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
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const updatedState = {
          ...REDUX_STATE.clients,
          isFetching: testCase.initialStatus,
        };
        const result = clientsReducer(updatedState, testCase.action);

        expect(result.isFetching).toEqual(testCase.expectedStatus);
      });
    }
  });

  test(`the isClientIncludedToggled action flips the "isIncluded" value of the client with id = payload`, () => {
    const updatedState = set(
      lensProp("source"),
      {
        [TOGGL_CLIENT_ID]: {
          ...REDUX_STATE.clients.source[TOGGL_CLIENT_ID],
          isIncluded: false,
        },
      },
      REDUX_STATE.clients,
    );

    const result = clientsReducer(
      updatedState,
      clientsActions.isClientIncludedToggled(TOGGL_CLIENT_ID),
    );

    expect(result.source[TOGGL_CLIENT_ID].isIncluded).toBe(true);
  });

  test(`the areAllClientsIncludedUpdated action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...REDUX_STATE.clients,
      source: {
        [TOGGL_CLIENT_ID]: { ...TOGGL_CLIENT, isIncluded: false, linkedId: null },
      },
      target: {},
    };

    const result = clientsReducer(updatedState, clientsActions.areAllClientsIncludedUpdated(true));

    expect(result.source[TOGGL_CLIENT_ID].isIncluded).toBe(true);
  });

  test("the deleteClients.success action resets state to initial state", () => {
    const result = clientsReducer(REDUX_STATE.clients, clientsActions.deleteClients.success());

    expect(result).toEqual(initialState);
  });
});
