import { FAKES } from "~/testUtilities";

import * as userGroupsSelectors from "../userGroupsSelectors";

describe("within userGroupsSelectors", () => {
  test("the sourceUserGroupsSelector returns array of values from state.source", () => {
    const result = userGroupsSelectors.sourceUserGroupsSelector(FAKES.REDUX_STATE);

    expect(result).toEqual(Object.values(FAKES.REDUX_STATE.userGroups.source));
  });

  describe("the selectors match their snapshots", () => {
    const testCases = [
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
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(FAKES.REDUX_STATE);

        expect(result).toMatchSnapshot();
      });
    }
  });
});
