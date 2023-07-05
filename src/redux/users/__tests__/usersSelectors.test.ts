import { describe, expect, test } from "vitest";

import { FAKES } from "~/testUtilities";
import { EntityGroup } from "~/types";

import * as usersSelectors from "../usersSelectors";

const MOCK_STATE = {
  ...FAKES.REDUX_STATE,
  users: {
    ...FAKES.REDUX_STATE.users,
    source: {
      ...FAKES.REDUX_STATE.users.source,
      "6002": {
        id: "6002",
        name: "Mary Testarossa",
        email: "mary@testarossa.com",
        isAdmin: null,
        isActive: true,
        userGroupIds: [],
        workspaceId: FAKES.TOGGL_WORKSPACE_ID,
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: EntityGroup.Users,
      },
    },
  },
};

describe("within usersSelectors", () => {
  test("the sourceUsersSelector returns array of values from state.source", () => {
    const result = usersSelectors.sourceUsersSelector(MOCK_STATE);

    expect(result).toEqual(Object.values(MOCK_STATE.users.source));
  });

  describe("the selectors match their snapshots", () => {
    const testCases = [
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
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(MOCK_STATE);

        expect(result).toMatchSnapshot();
      });
    }
  });
});
