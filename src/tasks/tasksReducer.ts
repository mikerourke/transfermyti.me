import { ActionType, createReducer } from "typesafe-actions";
import * as R from "ramda";
import * as tasksActions from "./tasksActions";
import { TasksByIdModel } from "./tasksTypes";

type TasksAction = ActionType<typeof tasksActions>;

export interface TasksState {
  readonly source: TasksByIdModel;
  readonly target: TasksByIdModel;
  readonly isFetching: boolean;
}

export const initialState: TasksState = {
  source: {},
  target: {},
  isFetching: false,
};

export const tasksReducer = createReducer<TasksState, TasksAction>(initialState)
  .handleAction(
    [tasksActions.createTasks.success, tasksActions.fetchTasks.success],
    (state, { payload }) => ({
      ...state,
      ...payload,
      isFetching: false,
    }),
  )
  .handleAction(
    [tasksActions.createTasks.request, tasksActions.fetchTasks.request],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [tasksActions.createTasks.failure, tasksActions.fetchTasks.failure],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(tasksActions.flipIsTaskIncluded, (state, { payload }) =>
    R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
