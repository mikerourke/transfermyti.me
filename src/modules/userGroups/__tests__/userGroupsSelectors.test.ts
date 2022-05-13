import cases from "jest-in-case";

import { FAKES } from "~/jestUtilities";

import * as userGroupsSelectors from "../userGroupsSelectors";

describe("within userGroupsSelectors", () => {
  test("the sourceUserGroupsSelector returns array of values from state.source", () => {
    const result = userGroupsSelectors.sourceUserGroupsSelector(FAKES.REDUX_STATE);

    expect(result).toEqual(Object.values(FAKES.REDUX_STATE.userGroups.source));
  });

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(FAKES.REDUX_STATE);

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
