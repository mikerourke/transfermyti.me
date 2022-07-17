import { inc, lensPath, over } from "ramda";
import { createReducer, type ActionType } from "typesafe-actions";

import * as allEntitiesActions from "~/modules/allEntities/allEntitiesActions";
import {
  EntityGroup,
  FetchStatus,
  ToolAction,
  ToolName,
  type CountsByEntityGroup,
  type ToolNameByMapping,
} from "~/typeDefs";

type AllEntitiesAction = ActionType<typeof allEntitiesActions>;

export interface AllEntitiesState {
  readonly areExistsInTargetShown: boolean;
  readonly entityGroupInProcess: EntityGroup | null;
  readonly fetchAllFetchStatus: FetchStatus;
  readonly pushAllChangesFetchStatus: FetchStatus;
  readonly toolAction: ToolAction;
  readonly toolNameByMapping: ToolNameByMapping;
  readonly transferCountsByEntityGroup: CountsByEntityGroup;
}

const DEFAULT_TRANSFER_COUNTS = {
  [EntityGroup.Clients]: 0,
  [EntityGroup.Tags]: 0,
  [EntityGroup.Projects]: 0,
  [EntityGroup.Tasks]: 0,
  [EntityGroup.TimeEntries]: 0,
  [EntityGroup.UserGroups]: 0,
  [EntityGroup.Users]: 0,
} as CountsByEntityGroup;

export const initialState: AllEntitiesState = {
  areExistsInTargetShown: true,
  entityGroupInProcess: null,
  fetchAllFetchStatus: FetchStatus.Pending,
  pushAllChangesFetchStatus: FetchStatus.Pending,
  toolAction: ToolAction.None,
  toolNameByMapping: {
    source: ToolName.None,
    target: ToolName.None,
  },
  transferCountsByEntityGroup: {
    ...DEFAULT_TRANSFER_COUNTS,
  },
};

export const allEntitiesReducer = createReducer<
  AllEntitiesState,
  AllEntitiesAction
>(initialState)
  .handleAction(
    [
      allEntitiesActions.createAllEntities.request,
      allEntitiesActions.deleteAllEntities.request,
    ],
    (state) => ({
      ...state,
      pushAllChangesFetchStatus: FetchStatus.InProcess,
      entityGroupInProcess: null,
    }),
  )
  .handleAction(
    [
      allEntitiesActions.createAllEntities.success,
      allEntitiesActions.deleteAllEntities.success,
    ],
    (state) => ({
      ...state,
      pushAllChangesFetchStatus: FetchStatus.Success,
      entityGroupInProcess: null,
    }),
  )
  .handleAction(
    [
      allEntitiesActions.createAllEntities.failure,
      allEntitiesActions.deleteAllEntities.failure,
    ],
    (state) => ({
      ...state,
      pushAllChangesFetchStatus: FetchStatus.Error,
      entityGroupInProcess: null,
    }),
  )
  .handleAction(allEntitiesActions.fetchAllEntities.request, (state) => ({
    ...state,
    fetchAllFetchStatus: FetchStatus.InProcess,
    entityGroupInProcess: null,
  }))
  .handleAction(allEntitiesActions.fetchAllEntities.success, (state) => ({
    ...state,
    fetchAllFetchStatus: FetchStatus.Success,
    entityGroupInProcess: null,
  }))
  .handleAction(allEntitiesActions.fetchAllEntities.failure, (state) => ({
    ...state,
    fetchAllFetchStatus: FetchStatus.Error,
    entityGroupInProcess: null,
  }))
  .handleAction(
    allEntitiesActions.pushAllChangesFetchStatusUpdated,
    (state, { payload }) => ({
      ...state,
      pushAllChangesFetchStatus: payload,
    }),
  )
  .handleAction(
    allEntitiesActions.fetchAllFetchStatusUpdated,
    (state, { payload }) => ({
      ...state,
      fetchAllFetchStatus: payload,
    }),
  )
  .handleAction(allEntitiesActions.allEntitiesFlushed, (state) => ({
    ...state,
    pushAllChangesFetchStatus: FetchStatus.Pending,
    fetchAllFetchStatus: FetchStatus.Pending,
  }))
  .handleAction(allEntitiesActions.toolActionUpdated, (state, { payload }) => ({
    ...state,
    toolAction: payload,
  }))
  .handleAction(
    allEntitiesActions.toolNameByMappingUpdated,
    (state, { payload }) => ({
      ...state,
      toolNameByMapping: {
        ...state.toolNameByMapping,
        ...payload,
      },
    }),
  )
  .handleAction(allEntitiesActions.isExistsInTargetShownToggled, (state) => ({
    ...state,
    areExistsInTargetShown: !state.areExistsInTargetShown,
  }))
  .handleAction(
    allEntitiesActions.entityGroupInProcessUpdated,
    (state, { payload }) => ({
      ...state,
      entityGroupInProcess: payload,
    }),
  )
  .handleAction(
    allEntitiesActions.transferCountsByEntityGroupReset,
    (state) => ({
      ...state,
      transferCountsByEntityGroup: { ...DEFAULT_TRANSFER_COUNTS },
    }),
  )
  .handleAction(
    allEntitiesActions.entityGroupTransferCompletedCountIncremented,
    (state, { payload }) =>
      over<AllEntitiesState, number>(
        lensPath(["transferCountsByEntityGroup", payload]),
        inc,
        state,
      ),
  );
