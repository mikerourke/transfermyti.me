import { inc, lensPath, over } from "ramda";

import {
  createReducer,
  isActionOf,
  type ActionType,
  type AnyAction,
} from "~/redux/reduxTools";
import {
  EntityGroup,
  FetchStatus,
  ToolAction,
  ToolName,
  type CountsByEntityGroup,
  type ToolNameByMapping,
} from "~/types";

import * as allEntitiesActions from "./allEntitiesActions";

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
  [EntityGroup.Projects]: 0,
  [EntityGroup.Tags]: 0,
  [EntityGroup.Tasks]: 0,
  [EntityGroup.TimeEntries]: 0,
  [EntityGroup.UserGroups]: 0,
  [EntityGroup.Users]: 0,
};

export const allEntitiesInitialState: AllEntitiesState = {
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

export const allEntitiesReducer = createReducer<AllEntitiesState>(
  allEntitiesInitialState,
  (builder) => {
    builder
      .addCase(allEntitiesActions.allEntitiesFlushed, (state) => {
        state.pushAllChangesFetchStatus = FetchStatus.Pending;
        state.fetchAllFetchStatus = FetchStatus.Pending;
      })
      .addCase(
        allEntitiesActions.entityGroupInProcessUpdated,
        (state, { payload }) => {
          state.entityGroupInProcess = payload;
        },
      )
      .addCase(
        allEntitiesActions.entityGroupTransferCompletedCountIncremented,
        (state, { payload }) =>
          over<AllEntitiesState, number>(
            lensPath(["transferCountsByEntityGroup", payload]),
            inc,
            state,
          ),
      )
      .addCase(
        allEntitiesActions.fetchAllFetchStatusUpdated,
        (state, { payload }) => {
          state.fetchAllFetchStatus = payload;
        },
      )
      .addCase(allEntitiesActions.isExistsInTargetShownToggled, (state) => {
        state.areExistsInTargetShown = !state.areExistsInTargetShown;
      })
      .addCase(
        allEntitiesActions.pushAllChangesFetchStatusUpdated,
        (state, { payload }) => {
          state.pushAllChangesFetchStatus = payload;
        },
      )
      .addCase(allEntitiesActions.toolActionUpdated, (state, { payload }) => {
        state.toolAction = payload;
      })
      .addCase(
        allEntitiesActions.toolNameByMappingUpdated,
        (state, { payload }) => ({
          ...state,
          toolNameByMapping: {
            ...state.toolNameByMapping,
            ...payload,
          },
        }),
      )
      .addCase(
        allEntitiesActions.transferCountsByEntityGroupReset,
        (state) => ({
          ...state,
          transferCountsByEntityGroup: { ...DEFAULT_TRANSFER_COUNTS },
        }),
      )
      .addCase(allEntitiesActions.fetchAllEntities.request, (state) => {
        state.fetchAllFetchStatus = FetchStatus.InProcess;
        state.entityGroupInProcess = null;
      })
      .addCase(allEntitiesActions.fetchAllEntities.success, (state) => {
        state.fetchAllFetchStatus = FetchStatus.Success;
        state.entityGroupInProcess = null;
      })
      .addCase(allEntitiesActions.fetchAllEntities.failure, (state) => {
        state.fetchAllFetchStatus = FetchStatus.Error;
        state.entityGroupInProcess = null;
      })
      .addMatcher(isAllEntitiesApiRequestAction, (state) => {
        state.pushAllChangesFetchStatus = FetchStatus.InProcess;
        state.entityGroupInProcess = null;
      })
      .addMatcher(isAllEntitiesApiSuccessAction, (state) => {
        state.pushAllChangesFetchStatus = FetchStatus.Success;
        state.entityGroupInProcess = null;
      })
      .addMatcher(isAllEntitiesApiFailureAction, (state) => {
        state.pushAllChangesFetchStatus = FetchStatus.Error;
        state.entityGroupInProcess = null;
      });
  },
);

type AllEntitiesApiRequestAction = ActionType<
  | typeof allEntitiesActions.createAllEntities.request
  | typeof allEntitiesActions.deleteAllEntities.request
>;

function isAllEntitiesApiRequestAction(
  action: AnyAction,
): action is AllEntitiesApiRequestAction {
  return isActionOf(
    [
      allEntitiesActions.createAllEntities.request,
      allEntitiesActions.deleteAllEntities.request,
    ],
    action,
  );
}

type AllEntitiesApiSuccessAction = ActionType<
  | typeof allEntitiesActions.createAllEntities.success
  | typeof allEntitiesActions.deleteAllEntities.success
>;

function isAllEntitiesApiSuccessAction(
  action: AnyAction,
): action is AllEntitiesApiSuccessAction {
  return isActionOf(
    [
      allEntitiesActions.createAllEntities.success,
      allEntitiesActions.deleteAllEntities.success,
    ],
    action,
  );
}

type AllEntitiesApiFailureAction = ActionType<
  | typeof allEntitiesActions.createAllEntities.failure
  | typeof allEntitiesActions.deleteAllEntities.failure
>;

function isAllEntitiesApiFailureAction(
  action: AnyAction,
): action is AllEntitiesApiFailureAction {
  return isActionOf(
    [
      allEntitiesActions.createAllEntities.failure,
      allEntitiesActions.deleteAllEntities.failure,
    ],
    action,
  );
}
