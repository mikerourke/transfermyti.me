import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import { get } from 'lodash';
import * as utils from '~/redux/utils';
import { togglTimeEntriesFetch } from '~/redux/entities/timeEntries/timeEntriesActions';
import * as projectsActions from './projectsActions';
import {
  ClockifyProjectModel,
  CompoundProjectModel,
  EntityGroup,
  EntityType,
  ReduxAction,
  ReduxStateEntryForTool,
  TogglProjectModel,
  TogglTimeEntryModel,
  ToolName,
} from '~/types';

export interface ProjectsState {
  readonly clockify: ReduxStateEntryForTool<CompoundProjectModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundProjectModel>;
  readonly isFetching: boolean;
}

export const initialState: ProjectsState = {
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
  value: ClockifyProjectModel | TogglProjectModel,
): CompoundProjectModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId: utils.findIdFieldValue(value, EntityType.Workspace),
  clientId: utils.findIdFieldValue(value, EntityType.Client),
  isBillable: value.billable,
  isPublic: 'public' in value ? value.public : !value.is_private,
  isActive: 'archived' in value ? value.archived : value.active,
  color: 'hex_color' in value ? value.hex_color : value.color,
  userIds: get(value, 'userIds', []).map((userId: number) => userId.toString()),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
  type: EntityType.Project,
});

export const projectsReducer = handleActions(
  {
    [combineActions(
      getType(projectsActions.clockifyProjectsFetch.success),
      getType(projectsActions.clockifyProjectsTransfer.success),
    )]: (
      state: ProjectsState,
      { payload: projects }: ReduxAction<Array<ClockifyProjectModel>>,
    ): ProjectsState => {
      const normalizedState = utils.normalizeState(
        ToolName.Clockify,
        EntityGroup.Projects,
        state,
        projects,
        schemaProcessStrategy,
      );

      return utils.linkEntitiesInStateByName(
        EntityGroup.Projects,
        normalizedState,
      );
    },

    [getType(projectsActions.togglProjectsFetch.success)]: (
      state: ProjectsState,
      { payload: projects }: ReduxAction<Array<TogglProjectModel>>,
    ): ProjectsState =>
      utils.normalizeState(
        ToolName.Toggl,
        EntityGroup.Projects,
        state,
        projects,
        schemaProcessStrategy,
      ),

    [combineActions(
      getType(projectsActions.clockifyProjectsFetch.request),
      getType(projectsActions.togglProjectsFetch.request),
      getType(projectsActions.clockifyProjectsTransfer.request),
    )]: (state: ProjectsState): ProjectsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(projectsActions.clockifyProjectsFetch.success),
      getType(projectsActions.clockifyProjectsFetch.failure),
      getType(projectsActions.togglProjectsFetch.success),
      getType(projectsActions.togglProjectsFetch.failure),
      getType(projectsActions.clockifyProjectsTransfer.success),
      getType(projectsActions.clockifyProjectsTransfer.failure),
    )]: (state: ProjectsState): ProjectsState => ({
      ...state,
      isFetching: false,
    }),

    [getType(projectsActions.flipIsProjectIncluded)]: (
      state: ProjectsState,
      { payload: projectId }: ReduxAction<string>,
    ): ProjectsState =>
      utils.flipEntityInclusion(state, EntityType.Project, projectId),

    [getType(togglTimeEntriesFetch.success)]: (
      state: ProjectsState,
      { payload: timeEntries }: ReduxAction<Array<TogglTimeEntryModel>>,
    ) =>
      utils.appendEntryCountToState(
        EntityType.Project,
        ToolName.Toggl,
        state,
        timeEntries,
      ),
  },
  initialState,
);
