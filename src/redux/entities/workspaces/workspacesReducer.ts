import { createReducer, ActionType } from "typesafe-actions";
import { get, uniq } from "lodash";
import * as utils from "~/redux/utils";
import * as workspacesActions from "./workspacesActions";
import {
  ClockifyWorkspaceModel,
  CompoundWorkspaceModel,
  EntityGroup,
  ReduxStateEntryForTool,
  TogglWorkspaceModel,
  ToolName,
} from "~/types";

type WorkspacesAction = ActionType<typeof workspacesActions>;

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
  isAdmin: get(value, "admin", null),
  workspaceId: value.id.toString(),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
  memberOf: EntityGroup.Workspaces,
});

export const workspacesReducer = createReducer<
  WorkspacesState,
  WorkspacesAction
>(initialState)
  .handleAction(
    [
      workspacesActions.clockifyWorkspacesFetch.success,
      workspacesActions.clockifyWorkspaceTransfer.success,
    ],
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Workspaces,
        entityState: state,
        payload,
        schemaProcessStrategy,
      });

      const linkedState = utils.linkEntitiesInStateByName(
        EntityGroup.Workspaces,
        normalizedState,
      );
      return { ...linkedState, isFetching: false };
    },
  )
  .handleAction(
    workspacesActions.togglWorkspacesFetch.success,
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.Workspaces,
        entityState: state,
        payload,
        schemaProcessStrategy,
      });
      return { ...normalizedState, isFetching: false };
    },
  )
  .handleAction(
    [
      workspacesActions.clockifyWorkspacesFetch.request,
      workspacesActions.clockifyWorkspaceTransfer.request,
      workspacesActions.togglWorkspacesFetch.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      workspacesActions.clockifyWorkspacesFetch.failure,
      workspacesActions.clockifyWorkspaceTransfer.failure,
      workspacesActions.togglWorkspacesFetch.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    workspacesActions.updateWorkspaceNameBeingFetched,
    (state, { payload }) => ({
      ...state,
      workspaceNameBeingFetched: payload,
    }),
  )
  .handleAction(
    workspacesActions.resetContentsForTool,
    (state, { payload }) => ({
      ...state,
      [payload]: initialState[payload],
    }),
  )
  .handleAction(
    workspacesActions.appendUserIdsToWorkspace,
    (state, { payload }) => {
      const { toolName, workspaceId, userIds } = payload;

      return {
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
      };
    },
  )
  .handleAction(
    workspacesActions.flipIsWorkspaceIncluded,
    (state, { payload }) => utils.flipEntityInclusion(state, payload),
  )
  .handleAction(
    workspacesActions.updateIsWorkspaceYearIncluded,
    (state, { payload }) => {
      const { workspaceId, year, isIncluded } = payload;
      const inclusionsByYear = get(
        state,
        ["toggl", "byId", workspaceId, "inclusionsByYear"],
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
  );
