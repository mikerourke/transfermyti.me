import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";
import * as allEntitiesActions from "./allEntitiesActions";
import {
  CountsByEntityGroupModel,
  EntityGroup,
  FetchStatus,
} from "./allEntitiesTypes";

type AllEntitiesAction = ActionType<typeof allEntitiesActions>;

export interface AllEntitiesState {
  readonly areExistsInTargetShown: boolean;
  readonly createAllFetchStatus: FetchStatus;
  readonly fetchAllFetchStatus: FetchStatus;
  readonly entityGroupInProcess: EntityGroup | null;
  readonly lastFetchTime: Date | null;
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
  createAllFetchStatus: FetchStatus.Pending,
  fetchAllFetchStatus: FetchStatus.Pending,
  entityGroupInProcess: null,
  lastFetchTime: null,
  transferCountsByEntityGroup: {
    ...DEFAULT_TRANSFER_COUNTS,
  },
};

export const allEntitiesReducer = createReducer<
  AllEntitiesState,
  AllEntitiesAction
>(initialState)
  .handleAction(allEntitiesActions.createAllEntities.request, state => ({
    ...state,
    createAllFetchStatus: FetchStatus.InProcess,
    entityGroupInProcess: null,
  }))
  .handleAction(allEntitiesActions.createAllEntities.success, state => ({
    ...state,
    createAllFetchStatus: FetchStatus.Success,
    entityGroupInProcess: null,
  }))
  .handleAction(allEntitiesActions.createAllEntities.failure, state => ({
    ...state,
    createAllFetchStatus: FetchStatus.Error,
    entityGroupInProcess: null,
  }))
  .handleAction(allEntitiesActions.fetchAllEntities.request, state => ({
    ...state,
    fetchAllFetchStatus: FetchStatus.InProcess,
    lastFetchTime: null,
    entityGroupInProcess: null,
  }))
  .handleAction(allEntitiesActions.fetchAllEntities.success, state => ({
    ...state,
    fetchAllFetchStatus: FetchStatus.Success,
    entityGroupInProcess: null,
    lastFetchTime: new Date(),
  }))
  .handleAction(allEntitiesActions.fetchAllEntities.failure, state => ({
    ...state,
    fetchAllFetchStatus: FetchStatus.Error,
    entityGroupInProcess: null,
    lastFetchTime: new Date(),
  }))
  .handleAction(allEntitiesActions.flipIfExistsInTargetShown, state => ({
    ...state,
    areExistsInTargetShown: !state.areExistsInTargetShown,
  }))
  .handleAction(
    allEntitiesActions.updateCreateAllFetchStatus,
    (state, { payload }) => ({
      ...state,
      createAllFetchStatus: payload,
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
  .handleAction(
    allEntitiesActions.updateLastFetchTime,
    (state, { payload }) => ({
      ...state,
      lastFetchTime: payload,
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
