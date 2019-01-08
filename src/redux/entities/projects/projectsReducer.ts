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
  clockifyProjectsTransferFailure,
  clockifyProjectsTransferStarted,
  clockifyProjectsTransferSuccess,
  updateIsProjectIncluded,
} from './projectsActions';
import {
  EntityGroup,
  EntityType,
  ReduxStateEntryForTool,
  ToolName,
} from '../../../types/commonTypes';
import {
  ClockifyProject,
  ProjectModel,
  TogglProject,
} from '../../../types/projectsTypes';
import { ReduxAction } from '../../rootReducer';

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
  workspaceId: getEntityIdFieldValue(value, EntityType.Workspace),
  clientId: getEntityIdFieldValue(value, EntityType.Client),
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
      clockifyProjectsFetchSuccess,
      clockifyProjectsTransferSuccess,
    )]: (
      state: ProjectsState,
      { payload: projects }: ReduxAction<ClockifyProject[]>,
    ): ProjectsState =>
      getEntityNormalizedState(
        ToolName.Clockify,
        EntityGroup.Projects,
        schemaProcessStrategy,
        state,
        projects,
      ),

    [togglProjectsFetchSuccess]: (
      state: ProjectsState,
      { payload: projects }: ReduxAction<TogglProject[]>,
    ): ProjectsState =>
      getEntityNormalizedState(
        ToolName.Toggl,
        EntityGroup.Projects,
        schemaProcessStrategy,
        state,
        projects,
      ),

    [combineActions(
      clockifyProjectsFetchStarted,
      togglProjectsFetchStarted,
      clockifyProjectsTransferStarted,
    )]: (state: ProjectsState): ProjectsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyProjectsFetchSuccess,
      clockifyProjectsFetchFailure,
      togglProjectsFetchSuccess,
      togglProjectsFetchFailure,
      clockifyProjectsTransferSuccess,
      clockifyProjectsTransferFailure,
    )]: (state: ProjectsState): ProjectsState => ({
      ...state,
      isFetching: false,
    }),

    [updateIsProjectIncluded]: (
      state: ProjectsState,
      { payload: projectId }: ReduxAction<string>,
    ): ProjectsState =>
      updateIsEntityIncluded(state, EntityType.Project, projectId),
  },
  initialState,
);
