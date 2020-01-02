import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";
import * as allEntitiesActions from "./allEntitiesActions";
import {
  EntityGroup,
  TransferCountsByEntityGroupModel,
} from "./allEntitiesTypes";

type AllEntitiesAction = ActionType<typeof allEntitiesActions>;

export interface AllEntitiesState {
  readonly areEntitiesCreating: boolean;
  readonly areEntitiesFetching: boolean;
  readonly entityGroupInProcess: EntityGroup | null;
  readonly lastFetchTime: Date | null;
  readonly transferCountsByEntityGroup: TransferCountsByEntityGroupModel;
}

const DEFAULT_TRANSFER_COUNTS = {
  [EntityGroup.Clients]: {
    countComplete: 0,
    countTotal: 0,
  },
  [EntityGroup.Tags]: {
    countComplete: 0,
    countTotal: 0,
  },
  [EntityGroup.Projects]: {
    countComplete: 0,
    countTotal: 0,
  },
  [EntityGroup.Tasks]: {
    countComplete: 0,
    countTotal: 0,
  },
  [EntityGroup.TimeEntries]: {
    countComplete: 0,
    countTotal: 0,
  },
};

export const initialState: AllEntitiesState = {
  areEntitiesCreating: false,
  areEntitiesFetching: false,
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
    areEntitiesCreating: true,
    entityGroupInProcess: null,
  }))
  .handleAction(
    [
      allEntitiesActions.createAllEntities.failure,
      allEntitiesActions.createAllEntities.success,
    ],
    state => ({
      ...state,
      areEntitiesCreating: false,
      entityGroupInProcess: null,
    }),
  )
  .handleAction(allEntitiesActions.fetchAllEntities.request, state => ({
    ...state,
    areEntitiesFetching: true,
    lastFetchTime: null,
    entityGroupInProcess: null,
  }))
  .handleAction(
    [
      allEntitiesActions.fetchAllEntities.failure,
      allEntitiesActions.fetchAllEntities.success,
    ],
    state => ({
      ...state,
      areEntitiesFetching: false,
      entityGroupInProcess: null,
      lastFetchTime: new Date(),
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
  .handleAction(
    allEntitiesActions.incrementEntityGroupTransferCountComplete,
    (state, { payload }) =>
      R.over<AllEntitiesState>(
        R.lensPath(["transferCountsByEntityGroup", payload, "countComplete"]),
        R.inc,
        state,
      ),
  )
  .handleAction(
    allEntitiesActions.updateEntityGroupTransferCountTotal,
    (state, { payload }) =>
      R.set<AllEntitiesState, number>(
        R.lensPath([
          "transferCountsByEntityGroup",
          payload.entityGroup,
          "countTotal",
        ]),
        payload.countTotal,
        state,
      ),
  );
