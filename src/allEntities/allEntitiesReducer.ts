import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";

import * as allEntitiesActions from "./allEntitiesActions";
import {
  CountsByEntityGroupModel,
  EntityGroup,
  FetchStatus,
  ToolAction,
  ToolName,
  ToolNameByMappingModel,
} from "~/typeDefs";

type AllEntitiesAction = ActionType<typeof allEntitiesActions>;

export interface AllEntitiesState {
  readonly areExistsInTargetShown: boolean;
  readonly entityGroupInProcess: EntityGroup | null;
  readonly fetchAllFetchStatus: FetchStatus;
  readonly pushAllChangesFetchStatus: FetchStatus;
  readonly toolAction: ToolAction;
  readonly toolNameByMapping: ToolNameByMappingModel;
  readonly transferCountsByEntityGroup: CountsByEntityGroupModel;
}

const DEFAULT_TRANSFER_COUNTS = {
  [EntityGroup.Clients]: 0,
  [EntityGroup.Tags]: 0,
  [EntityGroup.Projects]: 0,
  [EntityGroup.Tasks]: 0,
  [EntityGroup.TimeEntries]: 0,
  [EntityGroup.UserGroups]: 0,
  [EntityGroup.Users]: 0,
} as CountsByEntityGroupModel;

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
    allEntitiesActions.updatePushAllChangesFetchStatus,
    (state, { payload }) => ({
      ...state,
      pushAllChangesFetchStatus: payload,
    }),
  )
  .handleAction(
    allEntitiesActions.updateFetchAllFetchStatus,
    (state, { payload }) => ({
      ...state,
      fetchAllFetchStatus: payload,
    }),
  )
  .handleAction(allEntitiesActions.flushAllEntities, (state) => ({
    ...state,
    pushAllChangesFetchStatus: FetchStatus.Pending,
    fetchAllFetchStatus: FetchStatus.Pending,
  }))
  .handleAction(allEntitiesActions.updateToolAction, (state, { payload }) => ({
    ...state,
    toolAction: payload,
  }))
  .handleAction(
    allEntitiesActions.updateToolNameByMapping,
    (state, { payload }) => ({
      ...state,
      toolNameByMapping: {
        ...state.toolNameByMapping,
        ...payload,
      },
    }),
  )
  .handleAction(allEntitiesActions.flipIfExistsInTargetShown, (state) => ({
    ...state,
    areExistsInTargetShown: !state.areExistsInTargetShown,
  }))
  .handleAction(
    allEntitiesActions.updateEntityGroupInProcess,
    (state, { payload }) => ({
      ...state,
      entityGroupInProcess: payload,
    }),
  )
  .handleAction(
    allEntitiesActions.resetTransferCountsByEntityGroup,
    (state) => ({
      ...state,
      transferCountsByEntityGroup: { ...DEFAULT_TRANSFER_COUNTS },
    }),
  )
  .handleAction(
    allEntitiesActions.incrementEntityGroupTransferCompletedCount,
    (state, { payload }) =>
      R.over<AllEntitiesState, number>(
        R.lensPath(["transferCountsByEntityGroup", payload]),
        R.inc,
        state,
      ),
  );
