import cases from "jest-in-case";

import * as allEntitiesActions from "~/modules/allEntities/allEntitiesActions";
import { state, invalidAction } from "~/redux/__mocks__/mockStoreWithState";
import { EntityGroup, FetchStatus, ToolAction, ToolName } from "~/typeDefs";

import { allEntitiesReducer, initialState } from "../allEntitiesReducer";

const DEFAULT_TRANSFER_COUNTS = {
  ...initialState.transferCountsByEntityGroup,
};

describe("within allEntitiesReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = allEntitiesReducer(initialState, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = allEntitiesReducer(undefined as AnyValid, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  cases(
    "the pushAllChangesFetchStatus is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...state.allEntities,
        entityGroupInProcess: EntityGroup.Projects,
        pushAllChangesFetchStatus: options.initialStatus,
      };
      const result = allEntitiesReducer(updatedState, options.action);

      expect(result.pushAllChangesFetchStatus).toEqual(options.expectedStatus);
    },
    [
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
        name: "when the pushAllChangesFetchStatusChanged action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.pushAllChangesFetchStatusChanged(FetchStatus.Pending),
        expectedStatus: FetchStatus.Pending,
      },
      {
        name: "when the allEntitiesFlushed action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.allEntitiesFlushed(),
        expectedStatus: FetchStatus.Pending,
      },
    ],
  );

  cases(
    "the fetchAllFetchStatus is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...state.allEntities,
        entityGroupInProcess: EntityGroup.Projects,
        fetchAllFetchStatus: options.initialStatus,
      };
      const result = allEntitiesReducer(updatedState, options.action);

      expect(result.fetchAllFetchStatus).toEqual(options.expectedStatus);
    },
    [
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
        name: "when the updateFetchAllFetchStatus action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.fetchAllFetchStatusChanged(FetchStatus.Pending),
        expectedStatus: FetchStatus.Pending,
      },
      {
        name: "when the allEntitiesFlushed action is dispatched",
        initialStatus: FetchStatus.InProcess,
        action: allEntitiesActions.allEntitiesFlushed(),
        expectedStatus: FetchStatus.Pending,
      },
    ],
  );

  cases(
    "the correct state value is updated based on the dispatched action",
    (options) => {
      const updatedState = {
        ...state.allEntities,
        ...options.initialStateChange,
      };
      const result = allEntitiesReducer(updatedState, options.action);
      const expected = {
        ...updatedState,
        ...options.expectedStateChange,
      };

      expect(result).toEqual(expected);
    },
    [
      {
        name: "the toolActionChanged action updates state.toolAction",
        initialStateChange: { toolAction: ToolAction.None },
        action: allEntitiesActions.toolActionChanged(ToolAction.Delete),
        expectedStateChange: { toolAction: ToolAction.Delete },
      },
      {
        name: "the toolNameByMappingChanged action updates state.toolNameByMapping",
        initialStateChange: {
          toolNameByMapping: initialState.toolNameByMapping,
        },
        action: allEntitiesActions.toolNameByMappingChanged({
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
        name: "the entityGroupInProcessChanged action updates state.entityGroupInProcess",
        initialStateChange: { entityGroupInProcess: null },
        action: allEntitiesActions.entityGroupInProcessChanged(EntityGroup.Clients),
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
    ],
  );
});
