import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";
import * as allEntitiesActions from "./allEntitiesActions";
import { CountsByEntityGroupModel, EntityGroup, FetchStatus } from "~/typeDefs";

type AllEntitiesAction = ActionType<typeof allEntitiesActions>;

export interface AllEntitiesState {
  readonly areExistsInTargetShown: boolean;
  readonly fetchAllFetchStatus: FetchStatus;
  readonly pushAllChangesFetchStatus: FetchStatus;
  readonly entityGroupInProcess: EntityGroup | null;
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
  fetchAllFetchStatus: FetchStatus.Pending,
  pushAllChangesFetchStatus: FetchStatus.Pending,
  entityGroupInProcess: null,
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
    state => ({
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
    state => ({
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
    state => ({
      ...state,
      pushAllChangesFetchStatus: FetchStatus.Error,
      entityGroupInProcess: null,
    }),
  )
  .handleAction(allEntitiesActions.fetchAllEntities.request, state => ({
    ...state,
    fetchAllFetchStatus: FetchStatus.InProcess,
    entityGroupInProcess: null,
  }))
  .handleAction(allEntitiesActions.fetchAllEntities.success, state => ({
    ...state,
    fetchAllFetchStatus: FetchStatus.Success,
    entityGroupInProcess: null,
  }))
  .handleAction(allEntitiesActions.fetchAllEntities.failure, state => ({
    ...state,
    fetchAllFetchStatus: FetchStatus.Error,
    entityGroupInProcess: null,
  }))
  .handleAction(allEntitiesActions.flushAllEntities, state => ({
    ...state,
    pushAllChangesFetchStatus: FetchStatus.Pending,
    fetchAllFetchStatus: FetchStatus.Pending,
  }))
  .handleAction(allEntitiesActions.flipIfExistsInTargetShown, state => ({
    ...state,
    areExistsInTargetShown: !state.areExistsInTargetShown,
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
  .handleAction(
    allEntitiesActions.updateEntityGroupInProcess,
    (state, { payload }) => ({
      ...state,
      entityGroupInProcess: payload,
    }),
  )
  .handleAction(allEntitiesActions.resetTransferCountsByEntityGroup, state => ({
    ...state,
    transferCountsByEntityGroup: { ...DEFAULT_TRANSFER_COUNTS },
  }))
  .handleAction(
    allEntitiesActions.updateTransferCountsByEntityGroup,
    (state, { payload }) => ({
      ...state,
      transferCountsByEntityGroup: payload,
    }),
  )
  .handleAction(
    allEntitiesActions.incrementEntityGroupTransferCompletedCount,
    (state, { payload }) =>
      R.over<AllEntitiesState>(
        R.lensPath(["transferCountsByEntityGroup", payload]),
        R.inc,
        state,
      ),
  );
