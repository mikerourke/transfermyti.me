import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import * as utils from '~/redux/utils';
import { togglTimeEntriesFetch } from '~/redux/entities/timeEntries/timeEntriesActions';
import * as clientsActions from './clientsActions';
import {
  ClockifyClientModel,
  CompoundClientModel,
  EntitiesFetchPayloadModel,
  EntityGroup,
  EntityType,
  ReduxAction,
  ReduxStateEntryForTool,
  TogglClientModel,
  TogglTimeEntryModel,
  ToolName,
} from '~/types';

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

export const clientsReducer = handleActions(
  {
    [combineActions(
      getType(clientsActions.clockifyClientsFetch.success),
      getType(clientsActions.clockifyClientsTransfer.success),
    )]: (
      state: ClientsState,
      {
        payload: { entityRecords, workspaceId },
      }: ReduxAction<EntitiesFetchPayloadModel<ClockifyClientModel>>,
    ): ClientsState => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Clients,
        entityState: state,
        payload: entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(workspaceId),
      });

      return utils.linkEntitiesInStateByName(
        EntityGroup.Clients,
        normalizedState,
      );
    },

    [getType(clientsActions.togglClientsFetch.success)]: (
      state: ClientsState,
      {
        payload: { entityRecords, workspaceId },
      }: ReduxAction<EntitiesFetchPayloadModel<TogglClientModel>>,
    ): ClientsState =>
      utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.Clients,
        entityState: state,
        payload: entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(workspaceId),
      }),

    [combineActions(
      getType(clientsActions.clockifyClientsFetch.request),
      getType(clientsActions.clockifyClientsTransfer.request),
      getType(clientsActions.togglClientsFetch.request),
    )]: (state: ClientsState): ClientsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(clientsActions.clockifyClientsFetch.success),
      getType(clientsActions.clockifyClientsFetch.failure),
      getType(clientsActions.clockifyClientsTransfer.success),
      getType(clientsActions.clockifyClientsTransfer.failure),
      getType(clientsActions.togglClientsFetch.success),
      getType(clientsActions.togglClientsFetch.failure),
    )]: (state: ClientsState): ClientsState => ({
      ...state,
      isFetching: false,
    }),

    [getType(clientsActions.flipIsClientIncluded)]: (
      state: ClientsState,
      { payload: clientId }: ReduxAction<string>,
    ): ClientsState => utils.flipEntityInclusion(state, clientId),

    [getType(togglTimeEntriesFetch.success)]: (
      state: ClientsState,
      { payload: timeEntries }: ReduxAction<Array<TogglTimeEntryModel>>,
    ) =>
      utils.appendEntryCountToState({
        entityType: EntityType.Client,
        toolName: ToolName.Toggl,
        entityState: state,
        timeEntries,
      }),
  },
  initialState,
);
