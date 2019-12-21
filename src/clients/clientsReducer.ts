import { createReducer, ActionType } from "typesafe-actions";
import * as utils from "~/utils";
import { togglTimeEntriesFetch } from "~/timeEntries/timeEntriesActions";
import * as clientsActions from "./clientsActions";
import { EntityGroup, EntityType, ToolName } from "~/common/commonTypes";
import { ReduxStateEntryForTool } from "~/redux/reduxTypes";
import {
  ClockifyClientModel,
  CompoundClientModel,
  TogglClientModel,
} from "./clientsTypes";

type ClientsAction = ActionType<
  typeof clientsActions & typeof togglTimeEntriesFetch
>;

export interface ClientsState {
  readonly clockify: ReduxStateEntryForTool<CompoundClientModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundClientModel>;
  readonly isFetching: boolean;
}

export const initialState: ClientsState = {
  clockify: {
    byId: {},
    idValues: [],
  },
  toggl: {
    byId: {},
    idValues: [],
  },
  isFetching: false,
};

const getSchemaProcessStrategy = (workspaceId: string) => (
  value: ClockifyClientModel | TogglClientModel,
): CompoundClientModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId,
  linkedId: null,
  isIncluded: true,
  entryCount: 0,
  memberOf: EntityGroup.Clients,
});

export const clientsReducer = createReducer<ClientsState, ClientsAction>(
  initialState,
)
  .handleAction(
    [
      clientsActions.clockifyClientsFetch.success,
      clientsActions.clockifyClientsTransfer.success,
    ],
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Clients,
        entityState: state,
        payload: payload.entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
      });

      const linkedState = utils.linkEntitiesInStateByName(
        EntityGroup.Clients,
        normalizedState,
      );
      return { ...linkedState, isFetching: false };
    },
  )
  .handleAction(
    clientsActions.togglClientsFetch.success,
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.Clients,
        entityState: state,
        payload: payload.entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
      });
      return { ...normalizedState, isFetching: false };
    },
  )
  .handleAction(
    [
      clientsActions.clockifyClientsFetch.request,
      clientsActions.clockifyClientsTransfer.request,
      clientsActions.togglClientsFetch.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      clientsActions.clockifyClientsFetch.failure,
      clientsActions.clockifyClientsTransfer.failure,
      clientsActions.togglClientsFetch.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(clientsActions.flipIsClientIncluded, (state, { payload }) =>
    utils.flipEntityInclusion(state, payload),
  )
  .handleAction(togglTimeEntriesFetch.success, (state, { payload }) =>
    utils.appendEntryCountToState({
      entityType: EntityType.Client,
      toolName: ToolName.Toggl,
      entityState: state,
      timeEntries: payload,
    }),
  );
