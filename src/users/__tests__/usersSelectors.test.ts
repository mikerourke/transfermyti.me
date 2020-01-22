import cases from "jest-in-case";
import { state } from "~/redux/__mocks__/mockStoreWithState";
import * as usersSelectors from "../usersSelectors";

const TEST_STATE = {
  ...state,
  users: {
    source: {
      "6001": {
        id: "6001",
        name: "John Test",
        email: "test-user@test.com",
        isAdmin: null,
        isActive: true,
        userGroupIds: [],
        workspaceId: "1001",
        entryCount: 0,
        linkedId: "clock-user-01",
        isIncluded: false,
        memberOf: "users",
      },
      "6002": {
        id: "6002",
        name: "Mary Testarossa",
        email: "mary@testarossa.com",
        isAdmin: null,
        isActive: true,
        userGroupIds: [],
        workspaceId: null,
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: "users",
      },
    },
    target: {
      "clock-user-01": {
        id: "clock-user-01",
        name: "John Test",
        email: "test-user@test.com",
        isAdmin: null,
        isActive: true,
        userGroupIds: [],
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "6001",
        isIncluded: false,
        memberOf: "users",
      },
    },
    isFetching: false,
  },
};

describe("within usersSelectors", () => {
  test("the sourceUsersSelector returns array of values from state.source", () => {
    const result = usersSelectors.sourceUsersSelector(TEST_STATE);

    expect(result).toEqual(Object.values(TEST_STATE.users.source));
  });

  cases(
    "the selectors match their snapshots",
    options => {
      const result = options.selector(TEST_STATE);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "for the includedSourceUsersSelector",
        selector: usersSelectors.includedSourceUsersSelector,
      },
      {
        name: "for the userIdToLinkedIdSelector",
        selector: usersSelectors.userIdToLinkedIdSelector,
      },
      {
        name: "for the sourceUsersForTransferSelector",
        selector: usersSelectors.sourceUsersForTransferSelector,
      },
      {
        name: "for the sourceUserEmailsByWorkspaceIdSelector",
        selector: usersSelectors.sourceUserEmailsByWorkspaceIdSelector,
      },
    ],
  );
});
