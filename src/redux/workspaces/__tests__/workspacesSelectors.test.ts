import { describe, expect, test } from "vitest";

import { FAKES } from "~/testUtilities";
import { EntityGroup } from "~/types";

import * as workspacesSelectors from "../workspacesSelectors";

const { REDUX_STATE, CLOCKIFY_WORKSPACE } = FAKES;

const MOCK_STATE = {
  ...REDUX_STATE,
  workspaces: {
    ...REDUX_STATE.workspaces,
    source: {
      ...REDUX_STATE.workspaces.source,
      "1002": {
        id: "1002",
        name: "Test Workspace 2",
        userIds: ["6001"],
        isAdmin: true,
        isPaid: false,
        workspaceId: "1002",
        entryCount: 20,
        linkedId: null,
        isIncluded: true,
        memberOf: EntityGroup.Workspaces,
      },
    },
  },
};

describe("within workspacesSelectors", () => {
  describe("selectors that directly access state return the correct value", () => {
    const testCases = [
      {
        name: "areWorkspacesFetchingSelector returns state.isFetching",
        selector: workspacesSelectors.areWorkspacesFetchingSelector,
        expected: MOCK_STATE.workspaces.isFetching,
      },
      {
        name: "activeWorkspaceIdSelector returns values from state.activeWorkspaceId",
        selector: workspacesSelectors.activeWorkspaceIdSelector,
        expected: MOCK_STATE.workspaces.activeWorkspaceId,
      },
      {
        name: "sourceWorkspacesByIdSelector returns state.source",
        selector: workspacesSelectors.sourceWorkspacesByIdSelector,
        expected: MOCK_STATE.workspaces.source,
      },
      {
        name: "sourceWorkspacesSelector returns array of values from state.source",
        selector: workspacesSelectors.sourceWorkspacesSelector,
        expected: Object.values(MOCK_STATE.workspaces.source),
      },
      {
        name: "targetWorkspacesByIdSelector returns state.target",
        selector: workspacesSelectors.targetWorkspacesByIdSelector,
        expected: MOCK_STATE.workspaces.target,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(MOCK_STATE);

        expect(result).toEqual(testCase.expected);
      });
    }
  });

  describe("the selectors match their snapshots", () => {
    const testCases = [
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
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(MOCK_STATE);

        expect(result).toMatchSnapshot();
      });
    }
  });

  describe("the firstIncludedWorkspaceIdSelector", () => {
    test("returns the ID of the first included workspace if one is present in state", () => {
      const result = workspacesSelectors.firstIncludedWorkspaceIdSelector(MOCK_STATE);

      expect(result).toBe("1001");
    });

    test("returns an empty string if no included workspaces are present", () => {
      const updatedState = {
        ...MOCK_STATE,
        workspaces: {
          ...MOCK_STATE.workspaces,
          source: {
            "1001": {
              // @ts-expect-error
              ...MOCK_STATE.workspaces.source["1001"],
              isIncluded: false,
            },
          },
          target: {
            [CLOCKIFY_WORKSPACE.id]: {
              ...CLOCKIFY_WORKSPACE,
            },
          },
        },
      };

      const result = workspacesSelectors.firstIncludedWorkspaceIdSelector(updatedState);

      expect(result).toBe("");
    });
  });

  describe("the hasDuplicateTargetWorkspacesSelector", () => {
    test("returns false if not duplicate linkedIds are present", () => {
      const result = workspacesSelectors.hasDuplicateTargetWorkspacesSelector(MOCK_STATE);

      expect(result).toBe(false);
    });

    test("returns true if duplicate linkedIds are present", () => {
      const updatedState = {
        ...MOCK_STATE,
        workspaces: {
          ...MOCK_STATE.workspaces,
          source: {
            ...MOCK_STATE.workspaces.source,
            "1001": {
              // @ts-expect-error
              ...MOCK_STATE.workspaces.source["1001"],
              linkedId: "clock-workspace-01",
            },
            "1002": {
              ...MOCK_STATE.workspaces.source["1002"],
              linkedId: "clock-workspace-01",
            },
          },
        },
      };

      const result = workspacesSelectors.hasDuplicateTargetWorkspacesSelector(updatedState);

      expect(result).toBe(true);
    });
  });

  test("the includedWorkspaceIdsByMappingSelector ignores workspaces that aren't included", () => {
    const updatedState = {
      ...MOCK_STATE,
      workspaces: {
        ...MOCK_STATE.workspaces,
        source: {
          ...MOCK_STATE.workspaces.source,
          "1002": {
            ...MOCK_STATE.workspaces.source["1002"],
            isIncluded: false,
          },
        },
        target: {
          [CLOCKIFY_WORKSPACE.id]: {
            ...CLOCKIFY_WORKSPACE,
          },
        },
      },
    };

    const result = workspacesSelectors.includedWorkspaceIdsByMappingSelector(updatedState);

    expect(result).toEqual({
      source: ["1001"],
      target: [CLOCKIFY_WORKSPACE.id],
    });
  });

  test("the sourceIncludedWorkspacesCountSelector returns the count of included source workspaces", () => {
    const result = workspacesSelectors.sourceIncludedWorkspacesCountSelector(MOCK_STATE);

    expect(result).toBe(2);
  });
});
