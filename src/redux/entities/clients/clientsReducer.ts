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
  clockifyClientsTransferFailure,
  clockifyClientsTransferStarted,
  clockifyClientsTransferSuccess,
  updateIsClientIncluded,
} from './clientsActions';
import {
  ClientModel,
  ClockifyClient,
  TogglClient,
} from '../../../types/clientsTypes';
import {
  EntityGroup,
  EntityType,
  ReduxStateEntryForTool,
  ToolName,
} from '../../../types/commonTypes';
import { ReduxAction } from '../../rootReducer';

export interface ClientsState {
  readonly clockify: ReduxStateEntryForTool<ClientModel>;
  readonly toggl: ReduxStateEntryForTool<ClientModel>;
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
    [combineActions(
      clockifyClientsFetchSuccess,
      clockifyClientsTransferSuccess,
    )]: (
      state: ClientsState,
      { payload: clients }: ReduxAction<ClockifyClient[]>,
    ): ClientsState =>
      getEntityNormalizedState(
        ToolName.Clockify,
        EntityGroup.Clients,
        schemaProcessStrategy,
        state,
        clients,
      ),

    [togglClientsFetchSuccess]: (
      state: ClientsState,
      { payload: clients }: ReduxAction<TogglClient[]>,
    ): ClientsState =>
      getEntityNormalizedState(
        ToolName.Toggl,
        EntityGroup.Clients,
        schemaProcessStrategy,
        state,
        clients,
      ),

    [combineActions(
      clockifyClientsFetchStarted,
      togglClientsFetchStarted,
      clockifyClientsTransferStarted,
    )]: (state: ClientsState): ClientsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyClientsFetchSuccess,
      clockifyClientsFetchFailure,
      togglClientsFetchSuccess,
      togglClientsFetchFailure,
      clockifyClientsTransferSuccess,
      clockifyClientsTransferFailure,
    )]: (state: ClientsState): ClientsState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsClientIncluded]: (
      state: ClientsState,
      { payload: clientId }: ReduxAction<string>,
    ): ClientsState =>
      updateIsEntityIncluded(state, EntityType.Client, clientId),
  },
  initialState,
);
