import { combineActions, handleActions } from 'redux-actions';
import {
  getEntityIdFieldValue,
  getEntityNormalizedState,
  updateIsEntityIncluded,
} from '../../utils';
import {
  clockifyClientsFetchFailure,
  clockifyClientsFetchStarted,
  clockifyClientsFetchSuccess,
  togglClientsFetchFailure,
  togglClientsFetchStarted,
  togglClientsFetchSuccess,
  updateIsClientIncluded,
} from './clientsActions';
import {
  ClientModel,
  ClockifyClient,
  TogglClient,
} from '../../../types/clientsTypes';
import { EntityType, ToolName } from '../../../types/commonTypes';
import { ReduxAction } from '../../rootReducer';

interface ClientsEntryForTool {
  readonly clientsById: Record<string, ClientModel>;
  readonly clientIds: string[];
}

export interface ClientsState {
  readonly clockify: ClientsEntryForTool;
  readonly toggl: ClientsEntryForTool;
  readonly isFetching: boolean;
}

export const initialState: ClientsState = {
  clockify: {
    clientsById: {},
    clientIds: [],
  },
  toggl: {
    clientsById: {},
    clientIds: [],
  },
  isFetching: false,
};

const schemaProcessStrategy = (
  value: ClockifyClient | TogglClient,
): ClientModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId: getEntityIdFieldValue(value, EntityType.Workspace),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [clockifyClientsFetchSuccess]: (
      state: ClientsState,
      { payload: clients }: ReduxAction<ClockifyClient[]>,
    ): ClientsState =>
      getEntityNormalizedState<ClientsState, ClockifyClient[]>(
        ToolName.Clockify,
        EntityType.Client,
        schemaProcessStrategy,
        state,
        clients,
      ),

    [togglClientsFetchSuccess]: (
      state: ClientsState,
      { payload: clients }: ReduxAction<TogglClient[]>,
    ): ClientsState =>
      getEntityNormalizedState<ClientsState, TogglClient[]>(
        ToolName.Toggl,
        EntityType.Client,
        schemaProcessStrategy,
        state,
        clients,
      ),

    [combineActions(clockifyClientsFetchStarted, togglClientsFetchStarted)]: (
      state: ClientsState,
    ): ClientsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyClientsFetchSuccess,
      clockifyClientsFetchFailure,
      togglClientsFetchSuccess,
      togglClientsFetchFailure,
    )]: (state: ClientsState): ClientsState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsClientIncluded]: (
      state: ClientsState,
      { payload: clientId }: ReduxAction<string>,
    ): ClientsState =>
      updateIsEntityIncluded<ClientsState>(state, EntityType.Client, clientId),
  },
  initialState,
);
