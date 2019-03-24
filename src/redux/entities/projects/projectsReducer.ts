import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import { get } from 'lodash';
import {
  appendEntryCountToState,
  findIdFieldValue,
  normalizeState,
  flipEntityInclusion,
} from '~/redux/utils';
import { togglTimeEntriesFetch } from '~/redux/entities/timeEntries/timeEntriesActions';
import * as projectsActions from './projectsActions';
import {
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import { EntityGroup, EntityType } from '~/types/entityTypes';
import {
  ClockifyProject,
  ProjectModel,
  TogglProject,
} from '~/types/projectsTypes';
import { TogglTimeEntry } from '~/types/timeEntriesTypes';

export interface ProjectsState {
  readonly clockify: ReduxStateEntryForTool<ProjectModel>;
  readonly toggl: ReduxStateEntryForTool<ProjectModel>;
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
  value: ClockifyProject | TogglProject,
): ProjectModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId: findIdFieldValue(value, EntityType.Workspace),
  clientId: findIdFieldValue(value, EntityType.Client),
  isBillable: value.billable,
  isPublic: 'public' in value ? value.public : !value.is_private,
  isActive: 'archived' in value ? value.archived : value.active,
  color: 'hex_color' in value ? value.hex_color : value.color,
  userIds: get(value, 'userIds', []).map((userId: number) => userId.toString()),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [combineActions(
      getType(projectsActions.clockifyProjectsFetch.success),
      getType(projectsActions.clockifyProjectsTransfer.success),
    )]: (
      state: ProjectsState,
      { payload: projects }: ReduxAction<ClockifyProject[]>,
    ): ProjectsState =>
      normalizeState(
        ToolName.Clockify,
        EntityGroup.Projects,
        state,
        projects,
        schemaProcessStrategy,
      ),

    [getType(projectsActions.togglProjectsFetch.success)]: (
      state: ProjectsState,
      { payload: projects }: ReduxAction<TogglProject[]>,
    ): ProjectsState =>
      normalizeState(
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
      flipEntityInclusion(state, EntityType.Project, projectId),

    [getType(togglTimeEntriesFetch.success)]: (
      state: ProjectsState,
      { payload: timeEntries }: ReduxAction<TogglTimeEntry[]>,
    ) =>
      appendEntryCountToState(
        EntityType.Project,
        ToolName.Toggl,
        state,
        timeEntries,
      ),
  },
  initialState,
);
