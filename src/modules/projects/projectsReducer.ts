import * as R from "ramda";
import { type ActionType, createReducer } from "typesafe-actions";

import { updateAreAllRecordsIncluded } from "~/entityOperations/updateAreAllRecordsIncluded";
import { flushAllEntities } from "~/modules/allEntities/allEntitiesActions";
import * as projectsActions from "~/modules/projects/projectsActions";
import { Mapping, type Project } from "~/typeDefs";

type ProjectsAction = ActionType<
  typeof projectsActions | typeof flushAllEntities
>;

export interface ProjectsState {
  readonly source: Dictionary<Project>;
  readonly target: Dictionary<Project>;
  readonly isFetching: boolean;
}

export const initialState: ProjectsState = {
  source: {},
  target: {},
  isFetching: false,
};

export const projectsReducer = createReducer<ProjectsState, ProjectsAction>(
  initialState,
)
  .handleAction(
    [
      projectsActions.createProjects.success,
      projectsActions.fetchProjects.success,
    ],
    (state, { payload }) => ({
      ...state,
      source: {
        ...state.source,
        ...payload.source,
      },
      target: {
        ...state.target,
        ...payload.target,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      projectsActions.createProjects.request,
      projectsActions.deleteProjects.request,
      projectsActions.fetchProjects.request,
    ],
    (state) => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      projectsActions.createProjects.failure,
      projectsActions.deleteProjects.failure,
      projectsActions.fetchProjects.failure,
    ],
    (state) => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(projectsActions.flipIsProjectIncluded, (state, { payload }) =>
    R.over(R.lensPath([Mapping.Source, payload, "isIncluded"]), R.not, state),
  )
  .handleAction(projectsActions.updateIsProjectIncluded, (state, { payload }) =>
    R.set(
      R.lensPath([Mapping.Source, payload.id, "isIncluded"]),
      payload.isIncluded,
      state,
    ),
  )
  .handleAction(
    projectsActions.updateAreAllProjectsIncluded,
    (state, { payload }) => ({
      ...state,
      source: updateAreAllRecordsIncluded(state.source, payload),
    }),
  )
  .handleAction(
    [projectsActions.deleteProjects.success, flushAllEntities],
    () => ({ ...initialState }),
  );
