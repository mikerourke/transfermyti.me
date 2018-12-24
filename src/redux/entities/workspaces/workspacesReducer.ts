import { handleActions, combineActions } from 'redux-actions';
import { normalize, schema } from 'normalizr';
import isNil from 'lodash/isNil';
import {
  fetchClockifyWorkspacesStarted,
  fetchClockifyWorkspacesSuccess,
  fetchClockifyWorkspacesFailure,
  fetchTogglWorkspacesStarted,
  fetchTogglWorkspacesSuccess,
  fetchTogglWorkspacesFailure,
  updateIsWorkspaceSelected,
} from './workspacesActions';
import { WorkspaceModel } from '../../../types/workspaces';

interface WorkspacesEntryForTool {
  readonly workspacesById: Record<string, WorkspaceModel>;
  readonly workspaceIds: string[];
}

export interface WorkspacesState {
  readonly clockify: WorkspacesEntryForTool;
  readonly toggl: WorkspacesEntryForTool;
  readonly isFetching: boolean;
}

export const initialState: WorkspacesState = {
  clockify: {
    workspacesById: {},
    workspaceIds: [],
  },
  toggl: {
    workspacesById: {},
    workspaceIds: [],
  },
  isFetching: false,
};

const workspacesSchema = new schema.Entity(
  'workspaces',
  {},
  {
    processStrategy: ({ id, name, admin = null }) => ({
      id: id.toString(),
      name,
      isAdmin: admin,
      isSelected: isNil(admin) ? null : false,
    }),
  },
);

export default handleActions(
  {
    [fetchClockifyWorkspacesSuccess]: (
      state: WorkspacesState,
      { payload }: any,
    ): WorkspacesState => {
      const { entities, result } = normalize(payload, [workspacesSchema]);
      return {
        ...state,
        clockify: {
          ...state.clockify,
          workspacesById: entities.workspaces,
          workspaceIds: result,
        },
      };
    },

    [fetchTogglWorkspacesSuccess]: (
      state: WorkspacesState,
      { payload }: any,
    ): WorkspacesState => {
      const { entities, result } = normalize(payload, [workspacesSchema]);
      return {
        ...state,
        toggl: {
          ...state.toggl,
          workspacesById: entities.workspaces,
          workspaceIds: result,
        },
      };
    },

    [combineActions(
      fetchClockifyWorkspacesStarted,
      fetchTogglWorkspacesStarted,
    )]: (state: WorkspacesState): WorkspacesState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      fetchClockifyWorkspacesSuccess,
      fetchClockifyWorkspacesFailure,
      fetchTogglWorkspacesSuccess,
      fetchTogglWorkspacesFailure,
    )]: (state: WorkspacesState): WorkspacesState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsWorkspaceSelected]: (
      state: WorkspacesState,
      { payload: workspaceId }: any,
    ): WorkspacesState => ({
      ...state,
      toggl: {
        ...state.toggl,
        workspacesById: {
          ...state.toggl.workspacesById,
          [workspaceId]: {
            ...state.toggl.workspacesById[workspaceId],
            isSelected: !state.toggl.workspacesById[workspaceId].isSelected,
          },
        },
      },
    }),
  },
  initialState,
);
