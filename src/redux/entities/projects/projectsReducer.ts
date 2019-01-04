import { combineActions, handleActions } from 'redux-actions';
import get from 'lodash/get';
import {
  getEntityIdFieldValue,
  getEntityNormalizedState,
  updateIsEntityIncluded,
} from '../../utils';
import {
  clockifyProjectsFetchFailure,
  clockifyProjectsFetchStarted,
  clockifyProjectsFetchSuccess,
  togglProjectsFetchFailure,
  togglProjectsFetchStarted,
  togglProjectsFetchSuccess,
  updateIsProjectIncluded,
} from './projectsActions';
import { EntityType, ToolName } from '../../../types/commonTypes';
import {
  ClockifyProject,
  ProjectModel,
  TogglProject,
} from '../../../types/projectsTypes';
import { ReduxAction } from '../../rootReducer';

interface ProjectsEntryForTool {
  readonly projectsById: Record<string, ProjectModel>;
  readonly projectIds: string[];
}

export interface ProjectsState {
  readonly clockify: ProjectsEntryForTool;
  readonly toggl: ProjectsEntryForTool;
  readonly isFetching: boolean;
}

export const initialState: ProjectsState = {
  clockify: {
    projectsById: {},
    projectIds: [],
  },
  toggl: {
    projectsById: {},
    projectIds: [],
  },
  isFetching: false,
};

const schemaProcessStrategy = (
  value: ClockifyProject | TogglProject,
): ProjectModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId: getEntityIdFieldValue(value, EntityType.Workspace),
  clientId: getEntityIdFieldValue(value, EntityType.Client),
  isBillable: value.billable,
  isPublic: 'public' in value ? value.public : !value.is_private,
  isActive: 'archived' in value ? value.archived : value.active,
  color: 'hex_color' in value ? value.hex_color : value.color,
  userIds: get(value, 'userIds', []),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [clockifyProjectsFetchSuccess]: (
      state: ProjectsState,
      { payload: projects }: ReduxAction<ClockifyProject[]>,
    ): ProjectsState =>
      getEntityNormalizedState<ProjectsState, ClockifyProject[]>(
        ToolName.Clockify,
        EntityType.Project,
        schemaProcessStrategy,
        state,
        projects,
      ),

    [togglProjectsFetchSuccess]: (
      state: ProjectsState,
      { payload: projects }: ReduxAction<TogglProject[]>,
    ): ProjectsState =>
      getEntityNormalizedState<ProjectsState, TogglProject[]>(
        ToolName.Toggl,
        EntityType.Project,
        schemaProcessStrategy,
        state,
        projects,
      ),

    [combineActions(clockifyProjectsFetchStarted, togglProjectsFetchStarted)]: (
      state: ProjectsState,
    ): ProjectsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyProjectsFetchSuccess,
      clockifyProjectsFetchFailure,
      togglProjectsFetchSuccess,
      togglProjectsFetchFailure,
    )]: (state: ProjectsState): ProjectsState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsProjectIncluded]: (
      state: ProjectsState,
      { payload: projectId }: ReduxAction<string>,
    ): ProjectsState =>
      updateIsEntityIncluded<ProjectsState>(
        state,
        EntityType.Project,
        projectId,
      ),
  },
  initialState,
);
