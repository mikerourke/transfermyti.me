import cases from "jest-in-case";

import * as workspacesActions from "../workspacesActions";
import { workspacesReducer, initialState } from "../workspacesReducer";
import { flushAllEntities } from "~/modules/allEntities/allEntitiesActions";
import { state, invalidAction } from "~/redux/__mocks__/mockStoreWithState";
import { Mapping } from "~/typeDefs";

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
    const result = workspacesReducer(initialState, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = workspacesReducer(undefined as any, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  test("returns initial state when flushAllEntities is dispatched", () => {
    const result = workspacesReducer(TEST_WORKSPACES_STATE, flushAllEntities());

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

  test("the appendUserIdsToWorkspace action sets state mapping value to initial state", () => {
    const updatedState = {
      ...TEST_WORKSPACES_STATE,
      source: {
        ...TEST_WORKSPACES_STATE.source,
        [TEST_ALT_WORKSPACE.id]: TEST_ALT_WORKSPACE,
      },
    };

    const result = workspacesReducer(
      updatedState,
      workspacesActions.appendUserIdsToWorkspace({
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

  describe("the workspacesActions.updateWorkspaceLinking action", () => {
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
        workspacesActions.updateWorkspaceLinking({
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
        workspacesActions.updateWorkspaceLinking({
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

  describe("the flipIsWorkspaceIncluded action", () => {
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
        workspacesActions.flipIsWorkspaceIncluded(
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
      } as any;

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
        workspacesActions.flipIsWorkspaceIncluded(TEST_ALT_WORKSPACE),
      );

      expect(result.source[TEST_WORKSPACE_ID].isIncluded).toBe(true);
    });
  });

  test("the updateActiveWorkspaceId action sets state.activeWorkspaceId to the payload", () => {
    const result = workspacesReducer(
      initialState,
      workspacesActions.updateActiveWorkspaceId(TEST_WORKSPACE_ID),
    );

    expect(result.activeWorkspaceId).toBe(TEST_WORKSPACE_ID);
  });

  test("the resetContentsForMapping action sets state mapping value to initial state", () => {
    const result = workspacesReducer(
      TEST_WORKSPACES_STATE,
      workspacesActions.resetContentsForMapping(Mapping.Source),
    );

    expect(result.source).toEqual(initialState.source);
  });
});
