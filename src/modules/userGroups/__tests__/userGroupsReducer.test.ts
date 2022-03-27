import cases from "jest-in-case";
import * as R from "ramda";

import * as userGroupsActions from "~/modules/userGroups/userGroupsActions";
import { state, invalidAction } from "~/redux/__mocks__/mockStoreWithState";

import { userGroupsReducer, initialState } from "../userGroupsReducer";

const TEST_USER_GROUPS_STATE = { ...state.userGroups };

const TEST_USER_GROUP_ID = "5001";

const TEST_PAYLOAD = {
  source: { ...TEST_USER_GROUPS_STATE.source },
  target: { ...TEST_USER_GROUPS_STATE.target },
};

describe("within userGroupsReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = userGroupsReducer(initialState, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = userGroupsReducer(undefined as AnyValid, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  cases(
    "the isFetching is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...TEST_USER_GROUPS_STATE,
        isFetching: options.initialStatus,
      };
      const result = userGroupsReducer(updatedState, options.action);

      expect(result.isFetching).toEqual(options.expectedStatus);
    },
    [
      {
        name: "when the createUserGroups.success action is dispatched",
        initialStatus: true,
        action: userGroupsActions.createUserGroups.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchUserGroups.success action is dispatched",
        initialStatus: true,
        action: userGroupsActions.fetchUserGroups.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the createUserGroups.request action is dispatched",
        initialStatus: false,
        action: userGroupsActions.createUserGroups.request(),
        expectedStatus: true,
      },
      {
        name: "when the deleteUserGroups.request action is dispatched",
        initialStatus: false,
        action: userGroupsActions.deleteUserGroups.request(),
        expectedStatus: true,
      },
      {
        name: "when the fetchUserGroups.request action is dispatched",
        initialStatus: false,
        action: userGroupsActions.fetchUserGroups.request(),
        expectedStatus: true,
      },
      {
        name: "when the createUserGroups.failure action is dispatched",
        initialStatus: true,
        action: userGroupsActions.createUserGroups.failure(),
        expectedStatus: false,
      },
      {
        name: "when the deleteUserGroups.failure action is dispatched",
        initialStatus: true,
        action: userGroupsActions.deleteUserGroups.failure(),
        expectedStatus: false,
      },
      {
        name: "when the fetchUserGroups.failure action is dispatched",
        initialStatus: true,
        action: userGroupsActions.fetchUserGroups.failure(),
        expectedStatus: false,
      },
    ],
  );

  test(`the isUserGroupIncludedToggled action flips the "isIncluded" value of the userGroup with id = payload`, () => {
    const updatedState = R.set(
      R.lensProp("source"),
      {
        [TEST_USER_GROUP_ID]: {
          ...TEST_USER_GROUPS_STATE.source[TEST_USER_GROUP_ID],
          isIncluded: false,
        },
      },
      TEST_USER_GROUPS_STATE,
    );
    const result = userGroupsReducer(
      updatedState,
      userGroupsActions.isUserGroupIncludedToggled(TEST_USER_GROUP_ID),
    );

    expect(result.source[TEST_USER_GROUP_ID].isIncluded).toBe(true);
  });

  test("the deleteUserGroups.success action resets state to initial state", () => {
    const result = userGroupsReducer(state, userGroupsActions.deleteUserGroups.success());

    expect(result).toEqual(initialState);
  });
});
