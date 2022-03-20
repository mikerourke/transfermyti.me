import cases from "jest-in-case";
import * as R from "ramda";

import * as usersActions from "~/modules/users/usersActions";
import { state, invalidAction } from "~/redux/__mocks__/mockStoreWithState";

import { usersReducer, initialState } from "../usersReducer";

const TEST_USERS_STATE = { ...state.users };

const TEST_USER_ID = "6001";

const TEST_PAYLOAD = {
  source: { ...TEST_USERS_STATE.source },
  target: { ...TEST_USERS_STATE.target },
};

describe("within usersReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = usersReducer(initialState, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = usersReducer(undefined as any, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  cases(
    "the isFetching is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...TEST_USERS_STATE,
        isFetching: options.initialStatus,
      };
      const result = usersReducer(updatedState, options.action);

      expect(result.isFetching).toEqual(options.expectedStatus);
    },
    [
      {
        name: "when the createUsers.success action is dispatched",
        initialStatus: true,
        action: usersActions.createUsers.success(),
        expectedStatus: false,
      },
      {
        name: "when the fetchUsers.success action is dispatched",
        initialStatus: true,
        action: usersActions.fetchUsers.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the createUsers.request action is dispatched",
        initialStatus: false,
        action: usersActions.createUsers.request(),
        expectedStatus: true,
      },
      {
        name: "when the deleteUsers.request action is dispatched",
        initialStatus: false,
        action: usersActions.deleteUsers.request(),
        expectedStatus: true,
      },
      {
        name: "when the fetchUsers.request action is dispatched",
        initialStatus: false,
        action: usersActions.fetchUsers.request(),
        expectedStatus: true,
      },
      {
        name: "when the createUsers.failure action is dispatched",
        initialStatus: true,
        action: usersActions.createUsers.failure(),
        expectedStatus: false,
      },
      {
        name: "when the deleteUsers.failure action is dispatched",
        initialStatus: true,
        action: usersActions.deleteUsers.failure(),
        expectedStatus: false,
      },
      {
        name: "when the fetchUsers.failure action is dispatched",
        initialStatus: true,
        action: usersActions.fetchUsers.failure(),
        expectedStatus: false,
      },
    ],
  );

  test(`the flipIsUserIncluded action flips the "isIncluded" value of the user with id = payload`, () => {
    const updatedState = R.set(
      R.lensProp("source"),
      {
        [TEST_USER_ID]: {
          ...TEST_USERS_STATE.source[TEST_USER_ID],
          isIncluded: false,
        },
      },
      TEST_USERS_STATE,
    );
    const result = usersReducer(
      updatedState,
      usersActions.flipIsUserIncluded(TEST_USER_ID),
    );

    expect(result.source[TEST_USER_ID].isIncluded).toBe(true);
  });

  test("the deleteUsers.success action resets state to initial state", () => {
    const result = usersReducer(state, usersActions.deleteUsers.success());

    expect(result).toEqual(initialState);
  });
});
