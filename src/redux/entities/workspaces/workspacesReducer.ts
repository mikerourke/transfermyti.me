import { handleActions, combineActions } from 'redux-actions';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import ReduxEntity from '../../../utils/ReduxEntity';
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
  updateEntitiesFetchDetails,
} from './workspacesActions';
import {
  ClockifyWorkspace,
  TogglWorkspace,
  WorkspaceEntitiesFetchDetailsModel,
  WorkspaceModel,
  WorkspaceUserModel,
} from '../../../types/workspacesTypes';
import { EntityType, ToolName } from '../../../types/commonTypes';
import { ReduxAction } from '../../rootReducer';

interface WorkspacesEntryForTool {
  readonly workspacesById: Record<string, WorkspaceModel>;
  readonly workspaceIds: string[];
}

export interface WorkspacesState {
  readonly clockify: WorkspacesEntryForTool;
  readonly toggl: WorkspacesEntryForTool;
  readonly entitiesFetchDetails: WorkspaceEntitiesFetchDetailsModel;
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
  entitiesFetchDetails: {
    entityName: null,
    workspaceName: null,
  },
  isFetching: false,
};

interface ClockifyFullWorkspace extends ClockifyWorkspace {
  users: WorkspaceUserModel[];
}

interface TogglFullWorkspace extends TogglWorkspace {
  users: WorkspaceUserModel[];
}

const schemaProcessStrategy = (
  value: ClockifyFullWorkspace | TogglFullWorkspace,
): WorkspaceModel => ({
  id: value.id.toString(),
  name: value.name,
  inclusionsByYear: {},
  users: get(value, 'users', []),
  isAdmin: get(value, 'admin', null),
  isIncluded: true,
});

const reduxEntity = new ReduxEntity(
  EntityType.Workspace,
  schemaProcessStrategy,
);

export default handleActions(
  {
    [clockifyWorkspacesFetchSuccess]: (
      state: WorkspacesState,
      { payload }: ReduxAction<ClockifyFullWorkspace[]>,
    ): WorkspacesState =>
      reduxEntity.getNormalizedState<WorkspacesState, ClockifyFullWorkspace[]>(
        ToolName.Clockify,
        state,
        payload,
      ),

    [togglWorkspacesFetchSuccess]: (
      state: WorkspacesState,
      { payload }: ReduxAction<TogglFullWorkspace[]>,
    ): WorkspacesState =>
      reduxEntity.getNormalizedState<WorkspacesState, TogglFullWorkspace[]>(
        ToolName.Toggl,
        state,
        payload,
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

    [updateIsWorkspaceIncluded]: (
      state: WorkspacesState,
      { payload: workspaceId }: ReduxAction<string>,
    ): WorkspacesState =>
      reduxEntity.updateIsIncluded<WorkspacesState>(state, workspaceId),

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

    [updateEntitiesFetchDetails]: (
      state: WorkspacesState,
      { payload }: ReduxAction<WorkspaceEntitiesFetchDetailsModel>,
    ): WorkspacesState => ({
      ...state,
      entitiesFetchDetails: {
        ...state.entitiesFetchDetails,
        entityName: get(
          payload,
          'entityName',
          state.entitiesFetchDetails.entityName,
        ),
        workspaceName: get(
          payload,
          'workspaceName',
          state.entitiesFetchDetails.workspaceName,
        ),
      },
    }),
  },
  initialState,
);
