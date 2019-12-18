import { createReducer, ActionType } from "typesafe-actions";
import * as utils from "~/redux/utils";
import { togglTimeEntriesFetch } from "~/redux/entities/timeEntries/timeEntriesActions";
import * as tasksActions from "./tasksActions";
import {
  ClockifyTaskModel,
  CompoundTaskModel,
  EntityGroup,
  EntityType,
  ReduxStateEntryForTool,
  TogglTaskModel,
  ToolName,
} from "~/types";

type TasksAction = ActionType<
  typeof tasksActions & typeof togglTimeEntriesFetch
>;

export interface TasksState {
  readonly clockify: ReduxStateEntryForTool<CompoundTaskModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundTaskModel>;
  readonly isFetching: boolean;
}

export const initialState: TasksState = {
  clockify: {
    byId: {},
    idValues: [],
  },
  toggl: {
    byId: {},
    idValues: [],
  },
  isFetching: false,
};

const convertSecondsToClockifyEstimate = (seconds: number): string => {
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `PT${minutes}M`;
  }

  const hours = minutes / 60;
  return `PT${hours}H`;
};

const getSchemaProcessStrategy = (workspaceId: string) => (
  value: ClockifyTaskModel | TogglTaskModel,
): CompoundTaskModel => ({
  id: value.id.toString(),
  name: value.name,
  estimate:
    "estimated_seconds" in value
      ? convertSecondsToClockifyEstimate(value.estimated_seconds)
      : value.estimate,
  workspaceId,
  projectId: utils.findIdFieldValue(value, EntityType.Project),
  assigneeId: utils.findIdFieldValue(value, EntityType.User),
  isActive: "active" in value ? value.active : value.status === "ACTIVE",
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
  memberOf: EntityGroup.Tasks,
});

export const tasksReducer = createReducer<TasksState, TasksAction>(initialState)
  .handleAction(
    [
      tasksActions.clockifyTasksFetch.success,
      tasksActions.clockifyTasksTransfer.success,
    ],
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Tasks,
        entityState: state,
        payload: payload.entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
      });

      const linkedState = utils.linkEntitiesInStateByName(
        EntityGroup.Tasks,
        normalizedState,
      );
      return { ...linkedState, isFetching: false };
    },
  )
  .handleAction(tasksActions.togglTasksFetch.success, (state, { payload }) => {
    const normalizedState = utils.normalizeState({
      toolName: ToolName.Toggl,
      entityGroup: EntityGroup.Tasks,
      entityState: state,
      payload: payload.entityRecords,
      schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
    });
    return { ...normalizedState, isFetching: false };
  })
  .handleAction(
    [
      tasksActions.clockifyTasksFetch.request,
      tasksActions.clockifyTasksTransfer.request,
      tasksActions.togglTasksFetch.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      tasksActions.clockifyTasksFetch.failure,
      tasksActions.clockifyTasksTransfer.failure,
      tasksActions.togglTasksFetch.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(tasksActions.flipIsTaskIncluded, (state, { payload }) =>
    utils.flipEntityInclusion(state, payload),
  )
  .handleAction(togglTimeEntriesFetch.success, (state, { payload }) =>
    utils.appendEntryCountToState({
      entityType: EntityType.Task,
      toolName: ToolName.Toggl,
      entityState: state,
      timeEntries: payload,
    }),
  );
