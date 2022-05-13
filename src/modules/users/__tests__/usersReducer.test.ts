import cases from "jest-in-case";
import { lensProp, set } from "ramda";

import { FAKES } from "~/jestUtilities";
import * as usersActions from "~/modules/users/usersActions";

import { initialState, usersReducer } from "../usersReducer";

const { INVALID_ACTION, REDUX_STATE, TOGGL_USER_ID } = FAKES;

const MOCK_PAYLOAD = {
  source: { ...REDUX_STATE.users.source },
  target: { ...REDUX_STATE.users.target },
};

describe("within usersReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = usersReducer(initialState, INVALID_ACTION);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = usersReducer(undefined, INVALID_ACTION);

    expect(result).toEqual(initialState);
  });

  cases(
    "the isFetching is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...REDUX_STATE.users,
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
        action: usersActions.fetchUsers.success(MOCK_PAYLOAD),
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

  test(`the isUserIncludedToggled action flips the "isIncluded" value of the user with id = payload`, () => {
    const updatedState = set(
      lensProp("source"),
      {
        [TOGGL_USER_ID]: {
          ...REDUX_STATE.users.source[TOGGL_USER_ID],
          isIncluded: false,
        },
      },
      REDUX_STATE.users,
    );

    const result = usersReducer(updatedState, usersActions.isUserIncludedToggled(TOGGL_USER_ID));

    expect(result.source[TOGGL_USER_ID].isIncluded).toBe(true);
  });

  test("the deleteUsers.success action resets state to initial state", () => {
    const result = usersReducer(REDUX_STATE.users, usersActions.deleteUsers.success());

    expect(result).toEqual(initialState);
  });
});
