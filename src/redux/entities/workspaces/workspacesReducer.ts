import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import { get, uniq } from 'lodash';
import * as utils from '~/redux/utils';
import * as workspacesActions from './workspacesActions';
import {
  ClockifyWorkspaceModel,
  CompoundWorkspaceModel,
  EntityGroup,
  UpdateIncludedWorkspaceYearModel,
  ReduxAction,
  ReduxStateEntryForTool,
  TogglWorkspaceModel,
  ToolName,
} from '~/types';

export interface WorkspacesState {
  readonly clockify: ReduxStateEntryForTool<CompoundWorkspaceModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundWorkspaceModel>;
  readonly workspaceNameBeingFetched: string | null;
  readonly isFetching: boolean;
}

export const initialState: WorkspacesState = {
  clockify: {
    byId: {},
    idValues: [],
  },
  toggl: {
    byId: {},
    idValues: [],
  },
  workspaceNameBeingFetched: null,
  isFetching: false,
};

const schemaProcessStrategy = (
  value: ClockifyWorkspaceModel | TogglWorkspaceModel,
): CompoundWorkspaceModel => ({
  id: value.id.toString(),
  name: value.name,
  userIds: [],
  inclusionsByYear: {},
  isAdmin: get(value, 'admin', null),
  workspaceId: value.id.toString(),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
  memberOf: EntityGroup.Workspaces,
});

export const workspacesReducer = handleActions(
  {
    [combineActions(
      getType(workspacesActions.clockifyWorkspacesFetch.success),
      getType(workspacesActions.clockifyWorkspaceTransfer.success),
    )]: (
      state: WorkspacesState,
      { payload: workspaces }: ReduxAction<Array<ClockifyWorkspaceModel>>,
    ): WorkspacesState => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Workspaces,
        entityState: state,
        payload: workspaces,
        schemaProcessStrategy,
      });

      return utils.linkEntitiesInStateByName(
        EntityGroup.Workspaces,
        normalizedState,
      );
    },

    [getType(workspacesActions.togglWorkspacesFetch.success)]: (
      state: WorkspacesState,
      { payload: workspaces }: ReduxAction<Array<TogglWorkspaceModel>>,
    ): WorkspacesState =>
      utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.Workspaces,
        entityState: state,
        payload: workspaces,
        schemaProcessStrategy: schemaProcessStrategy,
      }),

    [combineActions(
      getType(workspacesActions.clockifyWorkspacesFetch.request),
      getType(workspacesActions.togglWorkspacesFetch.request),
      getType(workspacesActions.clockifyWorkspaceTransfer.request),
    )]: (state: WorkspacesState): WorkspacesState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(workspacesActions.clockifyWorkspacesFetch.success),
      getType(workspacesActions.clockifyWorkspacesFetch.failure),
      getType(workspacesActions.togglWorkspacesFetch.success),
      getType(workspacesActions.togglWorkspacesFetch.failure),
      getType(workspacesActions.clockifyWorkspaceTransfer.success),
      getType(workspacesActions.clockifyWorkspaceTransfer.failure),
    )]: (state: WorkspacesState): WorkspacesState => ({
      ...state,
      isFetching: false,
    }),

    [getType(workspacesActions.appendUserIdsToWorkspace)]: (
      state: WorkspacesState,
      {
        payload: { toolName, workspaceId, userIds },
      }: ReduxAction<{
        toolName: ToolName;
        workspaceId: string;
        userIds: Array<string>;
      }>,
    ): WorkspacesState => ({
      ...state,
      [toolName]: {
        ...state[toolName],
        byId: {
          ...state[toolName].byId,
          [workspaceId]: {
            ...state[toolName].byId[workspaceId],
            userIds: uniq([
              ...state[toolName].byId[workspaceId].userIds,
              ...userIds,
            ]),
          },
        },
      },
    }),

    [getType(workspacesActions.flipIsWorkspaceIncluded)]: (
      state: WorkspacesState,
      { payload: workspaceId }: ReduxAction<string>,
    ): WorkspacesState => utils.flipEntityInclusion(state, workspaceId),

    [getType(workspacesActions.updateIsWorkspaceYearIncluded)]: (
      state: WorkspacesState,
      {
        payload: { workspaceId, year, isIncluded },
      }: ReduxAction<UpdateIncludedWorkspaceYearModel>,
    ): WorkspacesState => {
      const inclusionsByYear = get(
        state,
        ['toggl', 'byId', workspaceId, 'inclusionsByYear'],
        {},
      );

      return {
        ...state,
        toggl: {
          ...state.toggl,
          byId: {
            ...state.toggl.byId,
            [workspaceId]: {
              ...state.toggl.byId[workspaceId],
              inclusionsByYear: {
                ...inclusionsByYear,
                [year]: isIncluded,
              },
            },
          },
        },
      };
    },

    [getType(workspacesActions.updateWorkspaceNameBeingFetched)]: (
      state: WorkspacesState,
      { payload: workspaceName }: ReduxAction<string>,
    ): WorkspacesState => ({
      ...state,
      workspaceNameBeingFetched: workspaceName,
    }),

    [getType(workspacesActions.resetContentsForTool)]: (
      state: WorkspacesState,
      { payload: toolName }: ReduxAction<string>,
    ): WorkspacesState => ({
      ...state,
      [toolName]: initialState[toolName],
    }),
  },
  initialState,
);
