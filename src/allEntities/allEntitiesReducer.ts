import { ActionType, createReducer } from "typesafe-actions";
import * as allEntitiesActions from "./allEntitiesActions";
import { EntityGroup } from "./allEntitiesTypes";

type AllEntitiesAction = ActionType<typeof allEntitiesActions>;

export interface AllEntitiesState {
  readonly areEntitiesFetching: boolean;
  readonly entityGroupInProcess: EntityGroup | null;
  readonly lastFetchTime: Date | null;
}

export const initialState: AllEntitiesState = {
  areEntitiesFetching: false,
  entityGroupInProcess: null,
  lastFetchTime: null,
};

export const allEntitiesReducer = createReducer<
  AllEntitiesState,
  AllEntitiesAction
>(initialState)
  .handleAction(
    [
      allEntitiesActions.createAllEntities.request,
      allEntitiesActions.fetchAllEntities.request,
    ],
    state => ({
      ...state,
      areEntitiesFetching: true,
      lastFetchTime: null,
      entityGroupInProcess: null,
    }),
  )
  .handleAction(
    [
      allEntitiesActions.createAllEntities.failure,
      allEntitiesActions.createAllEntities.success,
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
  );
