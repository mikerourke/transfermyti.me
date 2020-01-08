import { ActionType, createReducer } from "typesafe-actions";
import * as R from "ramda";
import { updateAreAllRecordsIncluded } from "~/redux/reduxUtils";
import { flushAllEntities } from "~/allEntities/allEntitiesActions";
import * as tasksActions from "./tasksActions";
import { TasksByIdModel } from "./tasksTypes";

type TasksAction = ActionType<typeof tasksActions | typeof flushAllEntities>;

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
  )
  .handleAction(
    tasksActions.updateAreAllTasksIncluded,
    (state, { payload }) => ({
      ...state,
      source: updateAreAllRecordsIncluded(state.source, payload),
    }),
  )
  .handleAction(tasksActions.updateIsTaskIncluded, (state, { payload }) =>
    R.set(
      R.lensPath(["source", payload.id, "isIncluded"]),
      payload.isIncluded,
      state,
    ),
  )
  .handleAction(flushAllEntities, () => ({ ...initialState }));
