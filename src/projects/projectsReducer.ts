import { createReducer, ActionType } from "typesafe-actions";
import { mod, toggle } from "shades";
import * as projectsActions from "./projectsActions";
import { ProjectModel } from "./projectsTypes";

type ProjectsAction = ActionType<typeof projectsActions>;

export interface ProjectsState {
  readonly source: Record<string, ProjectModel>;
  readonly target: Record<string, ProjectModel>;
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
      projectsActions.fetchClockifyProjects.success,
      projectsActions.fetchTogglProjects.success,
    ],
    (state, { payload }) => ({
      ...state,
      [payload.mapping]: {
        ...state[payload.mapping],
        ...payload.recordsById,
      },
      isFetching: false,
    }),
  )
  .handleAction(
    [
      projectsActions.createClockifyProjects.request,
      projectsActions.createTogglProjects.request,
      projectsActions.fetchClockifyProjects.request,
      projectsActions.fetchTogglProjects.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      projectsActions.createClockifyProjects.success,
      projectsActions.createTogglProjects.success,
      projectsActions.createClockifyProjects.failure,
      projectsActions.createTogglProjects.failure,
      projectsActions.fetchClockifyProjects.failure,
      projectsActions.fetchTogglProjects.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(projectsActions.flipIsProjectIncluded, (state, { payload }) =>
    mod("source", payload, "isIncluded")(toggle)(state),
  );
