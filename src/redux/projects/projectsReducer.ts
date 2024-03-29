import { lensPath, not, over, set } from "ramda";

import { updateAreAllRecordsIncluded } from "~/api/updateAreAllRecordsIncluded";
import { allEntitiesFlushed } from "~/redux/allEntities/allEntitiesActions";
import {
  createReducer,
  isActionOf,
  type Action,
  type ActionType,
} from "~/redux/reduxTools";
import { Mapping, type Project } from "~/types";

import * as projectsActions from "./projectsActions";

export type ProjectsState = Readonly<{
  source: Dictionary<Project>;
  target: Dictionary<Project>;
  isFetching: boolean;
}>;

export const projectsInitialState: ProjectsState = {
  source: {},
  target: {},
  isFetching: false,
};

export const projectsReducer = createReducer<ProjectsState>(
  projectsInitialState,
  (builder) => {
    builder
      .addCase(projectsActions.isProjectIncludedToggled, (state, { payload }) =>
        over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
      )
      .addCase(projectsActions.isProjectIncludedUpdated, (state, { payload }) =>
        set(
          lensPath([Mapping.Source, payload.id, "isIncluded"]),
          payload.isIncluded,
          state,
        ),
      )
      .addCase(
        projectsActions.areAllProjectsIncludedUpdated,
        (state, { payload }) => ({
          ...state,
          source: updateAreAllRecordsIncluded(state.source, payload),
        }),
      )
      .addMatcher(isProjectsApiSuccessAction, (state, { payload }) => ({
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
      }))
      .addMatcher(isProjectsApiRequestAction, (state) => {
        state.isFetching = true;
      })
      .addMatcher(isProjectsApiFailureAction, (state) => {
        state.isFetching = false;
      })
      .addMatcher(isResetProjectsStateAction, () => ({
        ...projectsInitialState,
      }));
  },
);

type ProjectsCreateOrFetchSuccessAction = ActionType<
  | typeof projectsActions.createProjects.success
  | typeof projectsActions.fetchProjects.success
>;

function isProjectsApiSuccessAction(
  action: Action,
): action is ProjectsCreateOrFetchSuccessAction {
  return isActionOf(
    [
      projectsActions.createProjects.success,
      projectsActions.fetchProjects.success,
    ],
    action,
  );
}

type ProjectsApiRequestAction = ActionType<
  | typeof projectsActions.createProjects.request
  | typeof projectsActions.deleteProjects.request
  | typeof projectsActions.fetchProjects.request
>;

function isProjectsApiRequestAction(
  action: Action,
): action is ProjectsApiRequestAction {
  return isActionOf(
    [
      projectsActions.createProjects.request,
      projectsActions.deleteProjects.request,
      projectsActions.fetchProjects.request,
    ],
    action,
  );
}

type ProjectsApiFailureAction = ActionType<
  | typeof projectsActions.createProjects.failure
  | typeof projectsActions.deleteProjects.failure
  | typeof projectsActions.fetchProjects.failure
>;

function isProjectsApiFailureAction(
  action: Action,
): action is ProjectsApiFailureAction {
  return isActionOf(
    [
      projectsActions.createProjects.failure,
      projectsActions.deleteProjects.failure,
      projectsActions.fetchProjects.failure,
    ],
    action,
  );
}

type ResetProjectsStateAction = ActionType<
  typeof projectsActions.deleteProjects.success | typeof allEntitiesFlushed
>;

function isResetProjectsStateAction(
  action: Action,
): action is ResetProjectsStateAction {
  return isActionOf(
    [projectsActions.deleteProjects.success, allEntitiesFlushed],
    action,
  );
}
