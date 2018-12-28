import { handleActions, combineActions } from 'redux-actions';
import { normalize, schema } from 'normalizr';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import {
  clockifyWorkspacesFetchStarted,
  clockifyWorkspacesFetchSuccess,
  clockifyWorkspacesFetchFailure,
  togglWorkspacesFetchStarted,
  togglWorkspacesFetchSuccess,
  togglWorkspacesFetchFailure,
  togglWorkspaceSummaryFetchStarted,
  togglWorkspaceSummaryFetchSuccess,
  togglWorkspaceSummaryFetchFailure,
  updateIsWorkspaceIncluded,
  updateIsWorkspaceYearIncluded,
} from './workspacesActions';
import { WorkspaceModel } from '../../../types/workspacesTypes';

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
    idAttribute: value => value.id.toString(),
    processStrategy: value => ({
      id: value.id.toString(),
      name: value.name,
      inclusionsByYear: {},
      isAdmin: 'admin' in value ? value.admin : false,
      isIncluded: true,
    }),
  },
);

export default handleActions(
  {
    [clockifyWorkspacesFetchSuccess]: (
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

    [togglWorkspacesFetchSuccess]: (
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

    [togglWorkspaceSummaryFetchSuccess]: (
      state: WorkspacesState,
      { payload: { workspaceId, inclusionsByYear } }: any,
    ): WorkspacesState => {
      const workspacesById = cloneDeep(state.toggl.workspacesById);
      const updatedWorkspacesById = Object.entries(workspacesById).reduce(
        (acc, [workspaceId, workspaceRecord]) => ({
          ...acc,
          [workspaceId]: {
            ...workspaceRecord,
            inclusionsByYear,
          },
        }),
        {},
      );

      return {
        ...state,
        toggl: {
          ...state.toggl,
          workspacesById: updatedWorkspacesById,
        },
      };
    },

    [combineActions(
      clockifyWorkspacesFetchStarted,
      togglWorkspacesFetchStarted,
      togglWorkspaceSummaryFetchStarted,
    )]: (state: WorkspacesState): WorkspacesState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyWorkspacesFetchSuccess,
      clockifyWorkspacesFetchFailure,
      togglWorkspacesFetchSuccess,
      togglWorkspacesFetchFailure,
      togglWorkspaceSummaryFetchSuccess,
      togglWorkspaceSummaryFetchFailure,
    )]: (state: WorkspacesState): WorkspacesState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsWorkspaceIncluded]: (
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
            isIncluded: !state.toggl.workspacesById[workspaceId].isIncluded,
          },
        },
      },
    }),

    [updateIsWorkspaceYearIncluded]: (
      state: WorkspacesState,
      { payload: { workspaceId, year } }: any,
    ): WorkspacesState => {
      const inclusionsByYear = get(
        state,
        ['toggl', 'workspacesById', workspaceId, 'inclusionsByYear'],
        {},
      );

      return {
        ...state,
        toggl: {
          ...state.toggl,
          workspacesById: {
            ...state.toggl.workspacesById,
            [workspaceId]: {
              ...state.toggl.workspacesById[workspaceId],
              inclusionsByYear: {
                ...inclusionsByYear,
                [year]: !inclusionsByYear[year],
              },
            },
          },
        },
      };
    },
  },
  initialState,
);
