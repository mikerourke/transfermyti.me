import cases from "jest-in-case";

import { allEntitiesFlushed } from "~/modules/allEntities/allEntitiesActions";
import * as workspacesActions from "~/modules/workspaces/workspacesActions";
import { invalidAction, state } from "~/redux/__mocks__/mockStoreWithState";
import { Mapping } from "~/typeDefs";

import { initialState, workspacesReducer } from "../workspacesReducer";

const TEST_WORKSPACES_STATE = { ...state.workspaces };

const TEST_WORKSPACE_ID = "1001";

const TEST_PAYLOAD = {
  source: { ...TEST_WORKSPACES_STATE.source },
  target: { ...TEST_WORKSPACES_STATE.target },
};

const TEST_ALT_WORKSPACE = {
  ...TEST_WORKSPACES_STATE.source[TEST_WORKSPACE_ID],
  name: "Test Workspace 2",
  id: "1002",
  workspaceId: "1002",
  userIds: [],
  linkedId: null,
  isIncluded: false,
};

describe("within workspacesReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = workspacesReducer(initialState, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = workspacesReducer(undefined as AnyValid, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  test("returns initial state when allEntitiesFlushed is dispatched", () => {
    const result = workspacesReducer(TEST_WORKSPACES_STATE, allEntitiesFlushed());

    expect(result).toEqual(initialState);
  });

  cases(
    "the isFetching is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...TEST_WORKSPACES_STATE,
        isFetching: options.initialStatus,
      };
      const result = workspacesReducer(updatedState, options.action);

      expect(result.isFetching).toEqual(options.expectedStatus);
    },
    [
      {
        name: "when the createWorkspaces.success action is dispatched",
        initialStatus: true,
        action: workspacesActions.createWorkspaces.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchWorkspaces.success action is dispatched",
        initialStatus: true,
        action: workspacesActions.fetchWorkspaces.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the createWorkspaces.request action is dispatched",
        initialStatus: false,
        action: workspacesActions.createWorkspaces.request(),
        expectedStatus: true,
      },
      {
        name: "when the fetchWorkspaces.request action is dispatched",
        initialStatus: false,
        action: workspacesActions.fetchWorkspaces.request(),
        expectedStatus: true,
      },
      {
        name: "when the createWorkspaces.failure action is dispatched",
        initialStatus: true,
        action: workspacesActions.createWorkspaces.failure(),
        expectedStatus: false,
      },
      {
        name: "when the fetchWorkspaces.failure action is dispatched",
        initialStatus: true,
        action: workspacesActions.fetchWorkspaces.failure(),
        expectedStatus: false,
      },
    ],
  );

  test("the userIdsAppendedToWorkspace action sets state mapping value to initial state", () => {
    const updatedState = {
      ...TEST_WORKSPACES_STATE,
      source: {
        ...TEST_WORKSPACES_STATE.source,
        [TEST_ALT_WORKSPACE.id]: TEST_ALT_WORKSPACE,
      },
    };

    const result = workspacesReducer(
      updatedState,
      workspacesActions.userIdsAppendedToWorkspace({
        workspaceId: TEST_ALT_WORKSPACE.id,
        mapping: Mapping.Source,
        userIds: ["6002"],
      }),
    );

    expect(result.source[TEST_ALT_WORKSPACE.id]).toEqual({
      ...TEST_ALT_WORKSPACE,
      userIds: ["6002"],
    });
  });

  describe("the workspaceLinkingUpdated action", () => {
    const TEST_TARGET_ID = "clockify-workspace-01";

    test(`updates the "isIncluded" and "linkedId" values when payload.targetId is not null`, () => {
      const updatedState = {
        ...TEST_WORKSPACES_STATE,
        source: {
          [TEST_WORKSPACE_ID]: {
            ...TEST_WORKSPACES_STATE.source[TEST_WORKSPACE_ID],
            isIncluded: false,
            linkedId: null,
          },
        },
        target: {
          [TEST_TARGET_ID]: {
            ...TEST_WORKSPACES_STATE.target[TEST_TARGET_ID],
            isIncluded: false,
            linkedId: null,
          },
        },
      };

      const result = workspacesReducer(
        updatedState,
        workspacesActions.workspaceLinkingUpdated({
          sourceId: TEST_WORKSPACE_ID,
          targetId: TEST_TARGET_ID,
        }),
      );

      expect(result.source[TEST_WORKSPACE_ID].isIncluded).toBe(true);
      expect(result.source[TEST_WORKSPACE_ID].linkedId).toBe(TEST_TARGET_ID);
      expect(result.target[TEST_TARGET_ID].isIncluded).toBe(true);
      expect(result.target[TEST_TARGET_ID].linkedId).toBe(TEST_WORKSPACE_ID);
    });

    test(`updates the "isIncluded" and "linkedId" values when payload.targetId is null`, () => {
      const updatedState = {
        ...TEST_WORKSPACES_STATE,
        source: {
          [TEST_WORKSPACE_ID]: {
            ...TEST_WORKSPACES_STATE.source[TEST_WORKSPACE_ID],
            isIncluded: true,
            linkedId: TEST_TARGET_ID,
          },
        },
        target: {
          [TEST_TARGET_ID]: {
            ...TEST_WORKSPACES_STATE.target[TEST_TARGET_ID],
            isIncluded: true,
            linkedId: TEST_WORKSPACE_ID,
          },
          "clock-workspace-02": {
            id: "clock-workspace-02",
            name: "Test Workspace",
            userIds: [],
            isAdmin: true,
            workspaceId: "clock-workspace-02",
            entryCount: 0,
            linkedId: null,
            isIncluded: false,
            memberOf: "workspaces",
          },
        },
      };

      const result = workspacesReducer(
        updatedState,
        workspacesActions.workspaceLinkingUpdated({
          sourceId: TEST_WORKSPACE_ID,
          targetId: null,
        }),
      );

      expect(result.source[TEST_WORKSPACE_ID].isIncluded).toBe(false);
      expect(result.source[TEST_WORKSPACE_ID].linkedId).toBeNull();
      expect(result.target[TEST_TARGET_ID].isIncluded).toBe(false);
      expect(result.target[TEST_TARGET_ID].linkedId).toBeNull();
    });
  });

  describe("the isWorkspaceIncludedToggled action", () => {
    const TARGET_ID = "clock-workspace-01";

    test(`flips the source and target "isIncluded" value if linked`, () => {
      const updatedState = {
        ...TEST_WORKSPACES_STATE,
        source: {
          ...TEST_WORKSPACES_STATE.source,
          [TEST_WORKSPACE_ID]: {
            ...TEST_WORKSPACES_STATE.source[TEST_WORKSPACE_ID],
            isIncluded: false,
          },
        },
        target: {
          ...TEST_WORKSPACES_STATE.target,
          [TARGET_ID]: {
            ...TEST_WORKSPACES_STATE.target[TARGET_ID],
            isIncluded: false,
          },
        },
      };

      const result = workspacesReducer(
        updatedState,
        workspacesActions.isWorkspaceIncludedToggled(
          TEST_WORKSPACES_STATE.source[TEST_WORKSPACE_ID],
        ),
      );

      expect(result.source[TEST_WORKSPACE_ID].isIncluded).toBe(true);
      expect(result.target[TARGET_ID].isIncluded).toBe(true);
    });

    test(`flips the source "isIncluded" value only if not linked`, () => {
      const TEST_CLOCKIFY_WORKSPACE = {
        id: "clock-workspace-01",
        name: "Test Workspace",
        userIds: [],
        isAdmin: true,
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: TEST_WORKSPACE_ID,
        isIncluded: true,
        memberOf: "workspaces",
      } as AnyValid;

      const updatedState = {
        ...TEST_WORKSPACES_STATE,
        source: {
          ...TEST_WORKSPACES_STATE.source,
          [TEST_ALT_WORKSPACE.id]: TEST_ALT_WORKSPACE,
        },
        target: {
          [TEST_CLOCKIFY_WORKSPACE.id]: TEST_CLOCKIFY_WORKSPACE,
        },
      };

      const result = workspacesReducer(
        updatedState,
        workspacesActions.isWorkspaceIncludedToggled(TEST_ALT_WORKSPACE),
      );

      expect(result.source[TEST_WORKSPACE_ID].isIncluded).toBe(true);
    });
  });

  test("the activeWorkspaceIdUpdated action sets state.activeWorkspaceId to the payload", () => {
    const result = workspacesReducer(
      initialState,
      workspacesActions.activeWorkspaceIdUpdated(TEST_WORKSPACE_ID),
    );

    expect(result.activeWorkspaceId).toBe(TEST_WORKSPACE_ID);
  });

  test("the contentsForMappingReset action sets state mapping value to initial state", () => {
    const result = workspacesReducer(
      TEST_WORKSPACES_STATE,
      workspacesActions.contentsForMappingReset(Mapping.Source),
    );

    expect(result.source).toEqual(initialState.source);
  });
});
