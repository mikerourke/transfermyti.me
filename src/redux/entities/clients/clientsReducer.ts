import { combineActions, handleActions } from 'redux-actions';
import ReduxEntity from '../../../utils/ReduxEntity';
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
  workspaceId: ReduxEntity.getIdFieldValue(value, EntityType.Workspace),
  entryCount: 0,
  isIncluded: true,
});

const reduxEntity = new ReduxEntity(EntityType.Client, schemaProcessStrategy);

export default handleActions(
  {
    [clockifyClientsFetchSuccess]: (
      state: ClientsState,
      { payload }: ReduxAction<ClockifyClient[]>,
    ): ClientsState =>
      reduxEntity.getNormalizedState<ClientsState, ClockifyClient[]>(
        ToolName.Clockify,
        state,
        payload,
      ),

    [togglClientsFetchSuccess]: (
      state: ClientsState,
      { payload }: ReduxAction<TogglClient[]>,
    ): ClientsState =>
      reduxEntity.getNormalizedState<ClientsState, TogglClient[]>(
        ToolName.Toggl,
        state,
        payload,
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
      reduxEntity.updateIsIncluded<ClientsState>(state, clientId),
  },
  initialState,
);
