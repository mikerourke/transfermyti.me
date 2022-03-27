import * as R from "ramda";
import { type ActionType, createReducer } from "typesafe-actions";

import { updateAreAllRecordsIncluded } from "~/entityOperations/updateAreAllRecordsIncluded";
import { allEntitiesFlushed } from "~/modules/allEntities/allEntitiesActions";
import * as tasksActions from "~/modules/tasks/tasksActions";
import { Mapping, type Task } from "~/typeDefs";

type TasksAction = ActionType<typeof tasksActions | typeof allEntitiesFlushed>;

export interface TasksState {
  readonly source: Dictionary<Task>;
  readonly target: Dictionary<Task>;
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
    [
      tasksActions.createTasks.request,
      tasksActions.deleteTasks.request,
      tasksActions.fetchTasks.request,
    ],
    (state) => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      tasksActions.createTasks.failure,
      tasksActions.deleteTasks.failure,
      tasksActions.fetchTasks.failure,
    ],
    (state) => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(tasksActions.isTaskIncludedToggled, (state, { payload }) =>
    R.over(R.lensPath([Mapping.Source, payload, "isIncluded"]), R.not, state),
  )
  .handleAction(tasksActions.isTaskIncludedUpdated, (state, { payload }) =>
    R.set(
      R.lensPath([Mapping.Source, payload.id, "isIncluded"]),
      payload.isIncluded,
      state,
    ),
  )
  .handleAction(
    tasksActions.areAllTasksIncludedUpdated,
    (state, { payload }) => ({
      ...state,
      source: updateAreAllRecordsIncluded(state.source, payload),
    }),
  )
  .handleAction([tasksActions.deleteTasks.success, allEntitiesFlushed], () => ({
    ...initialState,
  }));
