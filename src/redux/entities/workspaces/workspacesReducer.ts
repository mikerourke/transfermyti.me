import { handleActions, combineActions } from 'redux-actions';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import uniq from 'lodash/uniq';
import { getEntityNormalizedState, updateIsEntityIncluded } from '../../utils';
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
  appendUserIdsToWorkspace,
  updateIsWorkspaceIncluded,
  updateIsWorkspaceYearIncluded,
  updateWorkspaceNameBeingFetched,
} from './workspacesActions';
import { EntityType, ToolName } from '../../../types/commonTypes';
import {
  ClockifyWorkspace,
  TogglWorkspace,
  WorkspaceModel,
} from '../../../types/workspacesTypes';
import { ReduxAction } from '../../rootReducer';

interface WorkspacesEntryForTool {
  readonly workspacesById: Record<string, WorkspaceModel>;
  readonly workspaceIds: string[];
}

export interface WorkspacesState {
  readonly clockify: WorkspacesEntryForTool;
  readonly toggl: WorkspacesEntryForTool;
  readonly workspaceNameBeingFetched: string | null;
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
  workspaceNameBeingFetched: null,
  isFetching: false,
};

const schemaProcessStrategy = (
  value: ClockifyWorkspace | TogglWorkspace,
): WorkspaceModel => ({
  id: value.id.toString(),
  name: value.name,
  userIds: [],
  inclusionsByYear: {},
  isAdmin: get(value, 'admin', null),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [clockifyWorkspacesFetchSuccess]: (
      state: WorkspacesState,
      { payload: workspaces }: ReduxAction<ClockifyWorkspace[]>,
    ): WorkspacesState =>
      getEntityNormalizedState<WorkspacesState, ClockifyWorkspace[]>(
        ToolName.Clockify,
        EntityType.Workspace,
        schemaProcessStrategy,
        state,
        workspaces,
      ),

    [togglWorkspacesFetchSuccess]: (
      state: WorkspacesState,
      { payload: workspaces }: ReduxAction<TogglWorkspace[]>,
    ): WorkspacesState =>
      getEntityNormalizedState<WorkspacesState, TogglWorkspace[]>(
        ToolName.Toggl,
        EntityType.Workspace,
        schemaProcessStrategy,
        state,
        workspaces,
      ),

    [togglWorkspaceSummaryFetchSuccess]: (
      state: WorkspacesState,
      {
        payload: { workspaceId, inclusionsByYear },
      }: ReduxAction<{
        workspaceId: string;
        inclusionsByYear: Record<string, boolean>;
      }>,
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

    [appendUserIdsToWorkspace]: (
      state: WorkspacesState,
      {
        payload: { toolName, workspaceId, userIds },
      }: ReduxAction<{
        toolName: ToolName;
        workspaceId: string;
        userIds: string[];
      }>,
    ): WorkspacesState => ({
      ...state,
      [toolName]: {
        ...state[toolName],
        workspacesById: {
          ...state[toolName].workspacesById,
          [workspaceId]: {
            ...state[toolName].workspacesById[workspaceId],
            userIds: uniq([
              ...state[toolName].workspacesById[workspaceId].userIds,
              ...userIds,
            ]),
          },
        },
      },
    }),

    [updateIsWorkspaceIncluded]: (
      state: WorkspacesState,
      { payload: workspaceId }: ReduxAction<string>,
    ): WorkspacesState =>
      updateIsEntityIncluded<WorkspacesState>(
        state,
        EntityType.Workspace,
        workspaceId,
      ),

    [updateIsWorkspaceYearIncluded]: (
      state: WorkspacesState,
      {
        payload: { workspaceId, year },
      }: ReduxAction<{ workspaceId: string; year: number }>,
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

    [updateWorkspaceNameBeingFetched]: (
      state: WorkspacesState,
      { payload: workspaceName }: ReduxAction<string>,
    ): WorkspacesState => ({
      ...state,
      workspaceNameBeingFetched: workspaceName,
    }),
  },
  initialState,
);
