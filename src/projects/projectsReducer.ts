import { createReducer, ActionType } from "typesafe-actions";
import * as R from "ramda";
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
      projectsActions.createProjects.success,
      projectsActions.fetchProjects.success,
    ],
    (state, { payload }) => ({
      ...state,
      ...payload,
      isFetching: false,
    }),
  )
  .handleAction(
    [
      projectsActions.createProjects.request,
      projectsActions.fetchProjects.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      projectsActions.createProjects.failure,
      projectsActions.fetchProjects.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(projectsActions.flipIsProjectIncluded, (state, { payload }) =>
    R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
