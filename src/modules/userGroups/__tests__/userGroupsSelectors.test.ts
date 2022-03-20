import cases from "jest-in-case";

import * as userGroupsSelectors from "../userGroupsSelectors";
import { state } from "~/redux/__mocks__/mockStoreWithState";

const TEST_STATE = {
  ...state,
  userGroups: {
    source: {
      "5001": {
        id: "5001",
        name: "Test Group A",
        userIds: [],
        workspaceId: "1001",
        entryCount: 0,
        linkedId: "clock-user-group-02",
        isIncluded: false,
        memberOf: "userGroups",
      },
      "5002": {
        id: "5002",
        name: "Test Group B",
        userIds: [],
        workspaceId: "1001",
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: "userGroups",
      },
    },
    target: {
      "clock-user-group-01": {
        id: "clock-user-group-01",
        name: "Admins",
        userIds: ["clock-user-01"],
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: "userGroups",
      },
      "clock-user-group-02": {
        id: "clock-user-group-02",
        name: "Test Group A",
        userIds: [],
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "5001",
        isIncluded: false,
        memberOf: "userGroups",
      },
    },
    isFetching: false,
  },
};

describe("within userGroupsSelectors", () => {
  test("the sourceUserGroupsSelector returns array of values from state.source", () => {
    const result = userGroupsSelectors.sourceUserGroupsSelector(TEST_STATE);

    expect(result).toEqual(Object.values(TEST_STATE.userGroups.source));
  });

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(TEST_STATE);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "for the includedSourceUserGroupsSelector",
        selector: userGroupsSelectors.includedSourceUserGroupsSelector,
      },
      {
        name: "for the sourceUserGroupsForTransferSelector",
        selector: userGroupsSelectors.sourceUserGroupsForTransferSelector,
      },
      {
        name: "for the sourceUserGroupsInActiveWorkspaceSelector",
        selector: userGroupsSelectors.sourceUserGroupsInActiveWorkspaceSelector,
      },
    ],
  );
});
