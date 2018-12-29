import { combineActions, handleActions } from 'redux-actions';
import get from 'lodash/get';
import ReduxEntity from '../../../utils/ReduxEntity';
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
  workspaceId: ReduxEntity.getIdFieldValue(value, EntityType.Workspace),
  clientId: ReduxEntity.getIdFieldValue(value, EntityType.Client),
  isBillable: value.billable,
  isPublic: 'public' in value ? value.public : !value.is_private,
  isActive: 'archived' in value ? value.archived : value.active,
  color: 'hex_color' in value ? value.hex_color : value.color,
  users: get(value, 'users', []),
  isIncluded: true,
});

const reduxEntity = new ReduxEntity(EntityType.Project, schemaProcessStrategy);

export default handleActions(
  {
    [clockifyProjectsFetchSuccess]: (
      state: ProjectsState,
      { payload }: ReduxAction<ClockifyProject[]>,
    ): ProjectsState =>
      reduxEntity.getNormalizedState<ProjectsState, ClockifyProject[]>(
        ToolName.Clockify,
        state,
        payload,
      ),

    [togglProjectsFetchSuccess]: (
      state: ProjectsState,
      { payload }: ReduxAction<TogglProject[]>,
    ): ProjectsState =>
      reduxEntity.getNormalizedState<ProjectsState, TogglProject[]>(
        ToolName.Toggl,
        state,
        payload,
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
      reduxEntity.updateIsIncluded<ProjectsState>(state, projectId),
  },
  initialState,
);
