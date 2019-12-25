import { createReducer, ActionType } from "typesafe-actions";
import * as R from "ramda";
import * as tasksActions from "./tasksActions";
import { TaskModel } from "./tasksTypes";

type TasksAction = ActionType<typeof tasksActions>;

export interface TasksState {
  readonly source: Record<string, TaskModel>;
  readonly target: Record<string, TaskModel>;
  readonly isFetching: boolean;
}

export const initialState: TasksState = {
  source: {},
  target: {},
  isFetching: false,
};

export const tasksReducer = createReducer<TasksState, TasksAction>(initialState)
  .handleAction(
    [
      tasksActions.fetchClockifyTasks.success,
      tasksActions.fetchTogglTasks.success,
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
      tasksActions.createClockifyTasks.request,
      tasksActions.createTogglTasks.request,
      tasksActions.fetchClockifyTasks.request,
      tasksActions.fetchTogglTasks.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      tasksActions.createClockifyTasks.success,
      tasksActions.createTogglTasks.success,
      tasksActions.createClockifyTasks.failure,
      tasksActions.createTogglTasks.failure,
      tasksActions.fetchClockifyTasks.failure,
      tasksActions.fetchTogglTasks.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(tasksActions.flipIsTaskIncluded, (state, { payload }) =>
    R.over(R.lensPath(["source", payload, "isIncluded"]), R.not, state),
  );
