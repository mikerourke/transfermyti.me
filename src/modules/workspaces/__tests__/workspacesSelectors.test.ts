import cases from "jest-in-case";

import { state } from "~/redux/__mocks__/mockStoreWithState";

import * as workspacesSelectors from "../workspacesSelectors";

const TEST_STATE = {
  ...state,
  workspaces: {
    source: {
      "1001": {
        id: "1001",
        name: "Test Workspace",
        userIds: ["6001"],
        isAdmin: true,
        workspaceId: "1001",
        entryCount: 20,
        linkedId: "clock-workspace-01",
        isIncluded: true,
        memberOf: "workspaces",
      },
      "1002": {
        id: "1002",
        name: "Test Workspace 2",
        userIds: ["6001"],
        isAdmin: true,
        workspaceId: "1002",
        entryCount: 20,
        linkedId: null,
        isIncluded: true,
        memberOf: "workspaces",
      },
    },
    target: {
      "clock-workspace-01": {
        id: "clock-workspace-01",
        name: "Test Workspace",
        userIds: [],
        isAdmin: true,
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "1001",
        isIncluded: true,
        memberOf: "workspaces",
      },
    },
    isFetching: false,
  },
};

describe("within workspacesSelectors", () => {
  cases(
    "selectors that directly access state return the correct value",
    (options) => {
      const result = options.selector(TEST_STATE);

      expect(result).toEqual(options.expected);
    },
    [
      {
        name: "areWorkspacesFetchingSelector returns state.isFetching",
        selector: workspacesSelectors.areWorkspacesFetchingSelector,
        expected: TEST_STATE.workspaces.isFetching,
      },
      {
        name: "activeWorkspaceIdSelector returns values from state.activeWorkspaceId",
        selector: workspacesSelectors.activeWorkspaceIdSelector,
        expected: TEST_STATE.workspaces.activeWorkspaceId,
      },
      {
        name: "sourceWorkspacesByIdSelector returns state.source",
        selector: workspacesSelectors.sourceWorkspacesByIdSelector,
        expected: TEST_STATE.workspaces.source,
      },
      {
        name: "sourceWorkspacesSelector returns array of values from state.source",
        selector: workspacesSelectors.sourceWorkspacesSelector,
        expected: Object.values(TEST_STATE.workspaces.source),
      },
      {
        name: "targetWorkspacesByIdSelector returns state.target",
        selector: workspacesSelectors.targetWorkspacesByIdSelector,
        expected: TEST_STATE.workspaces.target,
      },
    ],
  );

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(TEST_STATE);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "for the includedSourceWorkspacesSelector",
        selector: workspacesSelectors.includedSourceWorkspacesSelector,
      },
      {
        name: "for the sourceWorkspacesForTransferSelector",
        selector: workspacesSelectors.sourceWorkspacesForTransferSelector,
      },
      {
        name: "for the workspaceIdToLinkedIdSelector",
        selector: workspacesSelectors.workspaceIdToLinkedIdSelector,
      },
      {
        name: "for the missingTargetWorkspacesSelector",
        selector: workspacesSelectors.missingTargetWorkspacesSelector,
      },
      {
        name: "for the includedSourceWorkspaceIdsSelector",
        selector: workspacesSelectors.includedSourceWorkspaceIdsSelector,
      },
      {
        name: "for the includedWorkspaceIdsByMappingSelector",
        selector: workspacesSelectors.includedWorkspaceIdsByMappingSelector,
      },
    ],
  );

  describe("the firstIncludedWorkspaceIdSelector", () => {
    test("returns the ID of the first included workspace if one is present in state", () => {
      const result =
        workspacesSelectors.firstIncludedWorkspaceIdSelector(TEST_STATE);

      expect(result).toBe("1001");
    });

    test("returns an empty string if no included workspaces are present", () => {
      const updatedState = {
        ...TEST_STATE,
        workspaces: {
          source: {
            "1001": {
              ...TEST_STATE.workspaces.source["1001"],
              isIncluded: false,
            },
          },
          target: TEST_STATE.workspaces.target,
        },
      };
      const result =
        workspacesSelectors.firstIncludedWorkspaceIdSelector(updatedState);

      expect(result).toBe("");
    });
  });

  describe("the hasDuplicateTargetWorkspacesSelector", () => {
    test("returns false if not duplicate linkedIds are present", () => {
      const result =
        workspacesSelectors.hasDuplicateTargetWorkspacesSelector(TEST_STATE);

      expect(result).toBe(false);
    });

    test("returns true if duplicate linkedIds are present", () => {
      const updatedState = {
        ...TEST_STATE,
        workspaces: {
          ...TEST_STATE.workspaces,
          source: {
            ...TEST_STATE.workspaces.source,
            "1001": {
              ...TEST_STATE.workspaces.source["1001"],
              linkedId: "clock-workspace-01",
            },
            "1002": {
              ...TEST_STATE.workspaces.source["1002"],
              linkedId: "clock-workspace-01",
            },
          },
        },
      };

      const result =
        workspacesSelectors.hasDuplicateTargetWorkspacesSelector(updatedState);

      expect(result).toBe(true);
    });
  });

  test("the includedWorkspaceIdsByMappingSelector ignores workspaces that aren't included", () => {
    const updatedState = {
      ...TEST_STATE,
      workspaces: {
        source: {
          ...TEST_STATE.workspaces.source,
          "1002": {
            ...TEST_STATE.workspaces.source["1002"],
            isIncluded: false,
          },
        },
        target: TEST_STATE.workspaces.target,
      },
    };
    const result =
      workspacesSelectors.includedWorkspaceIdsByMappingSelector(updatedState);

    expect(result).toEqual({
      source: ["1001"],
      target: ["clock-workspace-01"],
    });
  });

  test("the sourceIncludedWorkspacesCountSelector returns the count of included source workspaces", () => {
    const result =
      workspacesSelectors.sourceIncludedWorkspacesCountSelector(TEST_STATE);

    expect(result).toBe(2);
  });
});
