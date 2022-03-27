import { lensPath, not, over, set } from "ramda";
import { createReducer, type ActionType } from "typesafe-actions";

import { updateAreAllRecordsIncluded } from "~/entityOperations/updateAreAllRecordsIncluded";
import { allEntitiesFlushed } from "~/modules/allEntities/allEntitiesActions";
import * as projectsActions from "~/modules/projects/projectsActions";
import { Mapping, type Project } from "~/typeDefs";

type ProjectsAction = ActionType<
  typeof projectsActions | typeof allEntitiesFlushed
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
  .handleAction(
    projectsActions.isProjectIncludedToggled,
    (state, { payload }) =>
      over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
  )
  .handleAction(
    projectsActions.isProjectIncludedUpdated,
    (state, { payload }) =>
      set(
        lensPath([Mapping.Source, payload.id, "isIncluded"]),
        payload.isIncluded,
        state,
      ),
  )
  .handleAction(
    projectsActions.areAllProjectsIncludedUpdated,
    (state, { payload }) => ({
      ...state,
      source: updateAreAllRecordsIncluded(state.source, payload),
    }),
  )
  .handleAction(
    [projectsActions.deleteProjects.success, allEntitiesFlushed],
    () => ({ ...initialState }),
  );
