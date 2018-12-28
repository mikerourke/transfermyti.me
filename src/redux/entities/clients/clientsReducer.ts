import { handleActions, combineActions } from 'redux-actions';
import { normalize, schema } from 'normalizr';
import {
  clockifyClientsFetchStarted,
  clockifyClientsFetchSuccess,
  clockifyClientsFetchFailure,
  togglClientsFetchStarted,
  togglClientsFetchSuccess,
  togglClientsFetchFailure,
} from './clientsActions';
import { ClientModel } from '../../../types/clientsTypes';

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

const clientsSchema = new schema.Entity(
  'clients',
  {},
  {
    idAttribute: value => value.id.toString(),
    processStrategy: value => ({
      id: value.id.toString(),
      name: value.name,
      workspaceId: 'wid' in value ? value.wid.toString() : value.workspaceId,
      isIncluded: true,
    }),
  },
);

export default handleActions(
  {
    [clockifyClientsFetchSuccess]: (
      state: ClientsState,
      { payload }: any,
    ): ClientsState => {
      const { entities, result } = normalize(payload, [clientsSchema]);
      return {
        ...state,
        clockify: {
          ...state.clockify,
          clientsById: entities.clients,
          clientIds: result,
        },
      };
    },

    [togglClientsFetchSuccess]: (
      state: ClientsState,
      { payload }: any,
    ): ClientsState => {
      const { entities, result } = normalize(payload, [clientsSchema]);
      return {
        ...state,
        toggl: {
          ...state.toggl,
          clientsById: entities.clients,
          clientIds: result,
        },
      };
    },

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
  },
  initialState,
);
