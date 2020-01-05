import * as R from "ramda";
import { ActionType, createReducer } from "typesafe-actions";
import * as allEntitiesActions from "./allEntitiesActions";
import { CountsByEntityGroupModel, EntityGroup } from "./allEntitiesTypes";

type AllEntitiesAction = ActionType<typeof allEntitiesActions>;

export interface AllEntitiesState {
  readonly areEntitiesCreating: boolean;
  readonly areEntitiesFetching: boolean;
  readonly areExistsInTargetShown: boolean;
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
  areEntitiesCreating: false,
  areEntitiesFetching: false,
  areExistsInTargetShown: true,
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
  .handleAction(allEntitiesActions.flipIfExistsInTargetShown, state => ({
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
