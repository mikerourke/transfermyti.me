import { lensPath, not, over, set } from "ramda";

import { updateAreAllRecordsIncluded } from "~/api/updateAreAllRecordsIncluded";
import { allEntitiesFlushed } from "~/redux/allEntities/allEntitiesActions";
import {
  createReducer,
  isActionOf,
  type Action,
  type ActionType,
} from "~/redux/reduxTools";
import { Mapping, type Task } from "~/types";

import * as tasksActions from "./tasksActions";

export type TasksState = Readonly<{
  source: Dictionary<Task>;
  target: Dictionary<Task>;
  isFetching: boolean;
}>;

export const tasksInitialState: TasksState = {
  source: {},
  target: {},
  isFetching: false,
};

export const tasksReducer = createReducer<TasksState>(
  tasksInitialState,
  (builder) => {
    builder
      .addCase(
        tasksActions.areAllTasksIncludedUpdated,
        (state, { payload }) => ({
          ...state,
          source: updateAreAllRecordsIncluded(state.source, payload),
        }),
      )
      .addCase(tasksActions.isTaskIncludedToggled, (state, { payload }) =>
        over(lensPath([Mapping.Source, payload, "isIncluded"]), not, state),
      )
      .addCase(tasksActions.isTaskIncludedUpdated, (state, { payload }) =>
        set(
          lensPath([Mapping.Source, payload.id, "isIncluded"]),
          payload.isIncluded,
          state,
        ),
      )
      .addMatcher(isTasksApiSuccessAction, (state, { payload }) => ({
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
      .addMatcher(isTasksApiRequestAction, (state) => {
        state.isFetching = true;
      })
      .addMatcher(isTasksApiFailureAction, (state) => {
        state.isFetching = false;
      })
      .addMatcher(isResetTasksStateAction, () => ({
        ...tasksInitialState,
      }));
  },
);

type TasksCreateOrFetchSuccessAction = ActionType<
  | typeof tasksActions.createTasks.success
  | typeof tasksActions.fetchTasks.success
>;

function isTasksApiSuccessAction(
  action: Action,
): action is TasksCreateOrFetchSuccessAction {
  return isActionOf(
    [tasksActions.createTasks.success, tasksActions.fetchTasks.success],
    action,
  );
}

type TasksApiRequestAction = ActionType<
  | typeof tasksActions.createTasks.request
  | typeof tasksActions.deleteTasks.request
  | typeof tasksActions.fetchTasks.request
>;

function isTasksApiRequestAction(
  action: Action,
): action is TasksApiRequestAction {
  return isActionOf(
    [
      tasksActions.createTasks.request,
      tasksActions.deleteTasks.request,
      tasksActions.fetchTasks.request,
    ],
    action,
  );
}

type TasksApiFailureAction = ActionType<
  | typeof tasksActions.createTasks.failure
  | typeof tasksActions.deleteTasks.failure
  | typeof tasksActions.fetchTasks.failure
>;

function isTasksApiFailureAction(
  action: Action,
): action is TasksApiFailureAction {
  return isActionOf(
    [
      tasksActions.createTasks.failure,
      tasksActions.deleteTasks.failure,
      tasksActions.fetchTasks.failure,
    ],
    action,
  );
}

type ResetTasksStateAction = ActionType<
  typeof tasksActions.deleteTasks.success | typeof allEntitiesFlushed
>;

function isResetTasksStateAction(
  action: Action,
): action is ResetTasksStateAction {
  return isActionOf(
    [tasksActions.deleteTasks.success, allEntitiesFlushed],
    action,
  );
}
