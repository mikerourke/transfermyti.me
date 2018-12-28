import { handleActions, combineActions } from 'redux-actions';
import { normalize, schema } from 'normalizr';
import {
  clockifyProjectsFetchStarted,
  clockifyProjectsFetchSuccess,
  clockifyProjectsFetchFailure,
  togglProjectsFetchStarted,
  togglProjectsFetchSuccess,
  togglProjectsFetchFailure,
} from './projectsActions';
import { ProjectModel } from '../../../types/projectsTypes';

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

const projectsSchema = new schema.Entity(
  'projects',
  {},
  {
    idAttribute: value => value.id.toString(),
    processStrategy: value => ({
      id: value.id.toString(),
      name: value.name,
      workspaceId: 'wid' in value ? value.wid.toString() : value.workspaceId,
      clientId: 'cid' in value ? value.cid.toString() : value.clientId,
      isBillable: value.billable,
      isPublic: 'public' in value ? value.public : !value.is_private,
      isActive: 'archived' in value ? value.archived : value.active,
      color: 'hex_color' in value ? value.hex_color : value.color,
      isIncluded: true,
    }),
  },
);

export default handleActions(
  {
    [clockifyProjectsFetchSuccess]: (
      state: ProjectsState,
      { payload }: any,
    ): ProjectsState => {
      const { entities, result } = normalize(payload, [projectsSchema]);
      return {
        ...state,
        clockify: {
          ...state.clockify,
          projectsById: entities.projects,
          projectIds: result,
        },
      };
    },

    [togglProjectsFetchSuccess]: (
      state: ProjectsState,
      { payload }: any,
    ): ProjectsState => {
      const { entities, result } = normalize(payload, [projectsSchema]);
      return {
        ...state,
        toggl: {
          ...state.toggl,
          projectsById: entities.projects,
          projectIds: result,
        },
      };
    },

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
  },
  initialState,
);
