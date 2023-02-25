import { describe, expect, test } from "vitest";

import * as allEntitiesActions from "~/redux/allEntities/allEntitiesActions";
import { FAKES } from "~/testUtilities";
import { EntityGroup, FetchStatus, ToolAction, ToolName } from "~/typeDefs";

import { allEntitiesReducer, allEntitiesInitialState } from "../allEntitiesReducer";

const DEFAULT_TRANSFER_COUNTS = {
  ...allEntitiesInitialState.transferCountsByEntityGroup,
};

const { REDUX_STATE, INVALID_ACTION } = FAKES;

describe("within allEntitiesReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = allEntitiesReducer(allEntitiesInitialState, INVALID_ACTION);

    expect(result).toEqual(allEntitiesInitialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = allEntitiesReducer(undefined, INVALID_ACTION);

    expect(result).toEqual(allEntitiesInitialState);
  });

  describe("the pushAllChangesFetchStatus is set to the correct value based on the dispatched action", () => {
    const testCases = [
      {
        name: "when the createAllEntities.request action is dispatched",
        initialStatus: FetchStatus.Pending,
        action: allEntitiesActions.createAllEntities.request(),
        expectedStatus: FetchStatus.InProcess,
      },
      {
        name: "when the deleteAllEntities.request action is dispatched",
        initialStatus: FetchStatus.Pending,
        action: allEntitiesActions.deleteAllEntities.request(),
        expectedStatus: FetchStatus.InProcess,
      },
      {
        name: "when the createAllEntities.success action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.createAllEntities.success(),
        expectedStatus: FetchStatus.Success,
      },
      {
        name: "when the deleteAllEntities.success action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.deleteAllEntities.success(),
        expectedStatus: FetchStatus.Success,
      },
      {
        name: "when the createAllEntities.failure action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.createAllEntities.failure(),
        expectedStatus: FetchStatus.Error,
      },
      {
        name: "when the deleteAllEntities.failure action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.deleteAllEntities.failure(),
        expectedStatus: FetchStatus.Error,
      },
      {
        name: "when the pushAllChangesFetchStatusUpdated action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.pushAllChangesFetchStatusUpdated(FetchStatus.Pending),
        expectedStatus: FetchStatus.Pending,
      },
      {
        name: "when the allEntitiesFlushed action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.allEntitiesFlushed(),
        expectedStatus: FetchStatus.Pending,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const updatedState = {
          ...REDUX_STATE.allEntities,
          entityGroupInProcess: EntityGroup.Projects,
          pushAllChangesFetchStatus: testCase.initialStatus,
        };
        const result = allEntitiesReducer(updatedState, testCase.action);

        expect(result.pushAllChangesFetchStatus).toEqual(testCase.expectedStatus);
      });
    }
  });

  describe("the fetchAllFetchStatus is set to the correct value based on the dispatched action", () => {
    const testCases = [
      {
        name: "when the fetchAllEntities.request action is dispatched",
        initialStatus: FetchStatus.Pending,
        action: allEntitiesActions.fetchAllEntities.request(),
        expectedStatus: FetchStatus.InProcess,
      },
      {
        name: "when the fetchAllEntities.success action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.fetchAllEntities.success(),
        expectedStatus: FetchStatus.Success,
      },
      {
        name: "when the fetchAllEntities.failure action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.fetchAllEntities.failure(),
        expectedStatus: FetchStatus.Error,
      },
      {
        name: "when the fetchAllFetchStatusUpdated action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.fetchAllFetchStatusUpdated(FetchStatus.Pending),
        expectedStatus: FetchStatus.Pending,
      },
      {
        name: "when the allEntitiesFlushed action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.allEntitiesFlushed(),
        expectedStatus: FetchStatus.Pending,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const updatedState = {
          ...REDUX_STATE.allEntities,
          entityGroupInProcess: EntityGroup.Projects,
          fetchAllFetchStatus: testCase.initialStatus,
        };
        const result = allEntitiesReducer(updatedState, testCase.action);

        expect(result.fetchAllFetchStatus).toEqual(testCase.expectedStatus);
      });
    }
  });

  describe("the correct state value is updated based on the dispatched action", () => {
    const testCases = [
      {
        name: "the toolActionUpdated action updates state.toolAction",
        initialStateChange: { toolAction: ToolAction.None },
        action: allEntitiesActions.toolActionUpdated(ToolAction.Delete),
        expectedStateChange: { toolAction: ToolAction.Delete },
      },
      {
        name: "the toolNameByMappingUpdated action updates state.toolNameByMapping",
        initialStateChange: {
          toolNameByMapping: allEntitiesInitialState.toolNameByMapping,
        },
        action: allEntitiesActions.toolNameByMappingUpdated({
          source: ToolName.Toggl,
          target: ToolName.Clockify,
        }),
        expectedStateChange: {
          toolNameByMapping: {
            source: ToolName.Toggl,
            target: ToolName.Clockify,
          },
        },
      },
      {
        name: "the isExistsInTargetShownToggled action updates state.areExistsInTargetShown",
        initialStateChange: { areExistsInTargetShown: true },
        action: allEntitiesActions.isExistsInTargetShownToggled(),
        expectedStateChange: { areExistsInTargetShown: false },
      },
      {
        name: "the entityGroupInProcessUpdated action updates state.entityGroupInProcess",
        initialStateChange: { entityGroupInProcess: null },
        action: allEntitiesActions.entityGroupInProcessUpdated(EntityGroup.Clients),
        expectedStateChange: { entityGroupInProcess: EntityGroup.Clients },
      },
      {
        name: "the transferCountsByEntityGroupReset action sets state.transferCountsByEntityGroup to default",
        initialStateChange: {
          transferCountsByEntityGroup: {
            ...DEFAULT_TRANSFER_COUNTS,
            clients: 10,
            projects: 20,
          },
        },
        action: allEntitiesActions.transferCountsByEntityGroupReset(),
        expectedStateChange: {
          transferCountsByEntityGroup: { ...DEFAULT_TRANSFER_COUNTS },
        },
      },
      {
        name: "the entityGroupTransferCompletedCountIncremented action increments state.transferCountsByEntityGroup for specified group",
        initialStateChange: {
          transferCountsByEntityGroup: { ...DEFAULT_TRANSFER_COUNTS },
        },
        action: allEntitiesActions.entityGroupTransferCompletedCountIncremented(
          EntityGroup.Clients,
        ),
        expectedStateChange: {
          transferCountsByEntityGroup: {
            ...DEFAULT_TRANSFER_COUNTS,
            clients: 1,
          },
        },
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const updatedState = {
          ...REDUX_STATE.allEntities,
          ...testCase.initialStateChange,
        };

        const result = allEntitiesReducer(updatedState, testCase.action);

        const expected = {
          ...updatedState,
          ...testCase.expectedStateChange,
        };

        expect(result).toEqual(expected);
      });
    }
  });
});
