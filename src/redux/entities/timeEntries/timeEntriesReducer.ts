import { getType } from 'typesafe-actions';
import { combineActions, handleActions } from 'redux-actions';
import { get, isNil, isString } from 'lodash';
import { getEntityIdFieldValue, getEntityNormalizedState } from '~/redux/utils';
import * as timeEntriesActions from './timeEntriesActions';
import {
  EntityGroup,
  EntityType,
  ReduxAction,
  ReduxStateEntryForTool,
  ToolName,
} from '~/types/commonTypes';
import {
  ClockifyTimeEntry,
  TimeEntryModel,
  TogglTimeEntry,
} from '~/types/timeEntriesTypes';

export interface TimeEntriesState {
  readonly clockify: ReduxStateEntryForTool<TimeEntryModel>;
  readonly toggl: ReduxStateEntryForTool<TimeEntryModel>;
  readonly isFetching: boolean;
}

export const initialState: TimeEntriesState = {
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

const getTimeValue = (value: any, field: string): Date | null => {
  const timeValue =
    'timeInterval' in value
      ? get(value, ['timeInterval', field], null)
      : get(value, field, null);
  return isNil(timeValue) ? null : new Date(timeValue);
};

const schemaProcessStrategy = (
  value: ClockifyTimeEntry | TogglTimeEntry,
): TimeEntryModel => ({
  id: value.id.toString(),
  description: value.description,
  projectId: getEntityIdFieldValue(value, EntityType.Project),
  taskId: getEntityIdFieldValue(value, EntityType.Task),
  userId: getEntityIdFieldValue(value, EntityType.User),
  workspaceId: getEntityIdFieldValue(value, EntityType.Workspace),
  client:
    'client' in value
      ? value.client
      : get(value, ['project', 'clientName'], null),
  isBillable: 'is_billable' in value ? value.is_billable : value.billable,
  start: getTimeValue(value, 'start'),
  end: getTimeValue(value, 'end'),
  tags: isNil(value.tags)
    ? []
    : value.tags.map((tag: any) => (isString(tag) ? tag : get(tag, 'name'))),
  tagIds: [],
  name: null,
  linkedId: null,
  isIncluded: true,
});

export default handleActions(
  {
    [getType(timeEntriesActions.clockifyTimeEntriesFetch.success)]: (
      state: TimeEntriesState,
      { payload: timeEntries }: ReduxAction<ClockifyTimeEntry[]>,
    ): TimeEntriesState =>
      getEntityNormalizedState(
        ToolName.Clockify,
        EntityGroup.TimeEntries,
        schemaProcessStrategy,
        state,
        timeEntries,
      ),

    [getType(timeEntriesActions.togglTimeEntriesFetch.success)]: (
      state: TimeEntriesState,
      { payload: timeEntries }: ReduxAction<TogglTimeEntry[]>,
    ): TimeEntriesState =>
      getEntityNormalizedState(
        ToolName.Toggl,
        EntityGroup.TimeEntries,
        schemaProcessStrategy,
        state,
        timeEntries,
      ),

    [combineActions(
      getType(timeEntriesActions.clockifyTimeEntriesFetch.request),
      getType(timeEntriesActions.togglTimeEntriesFetch.request),
    )]: (state: TimeEntriesState): TimeEntriesState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(timeEntriesActions.clockifyTimeEntriesFetch.success),
      getType(timeEntriesActions.clockifyTimeEntriesFetch.failure),
      getType(timeEntriesActions.togglTimeEntriesFetch.success),
      getType(timeEntriesActions.togglTimeEntriesFetch.failure),
    )]: (state: TimeEntriesState): TimeEntriesState => ({
      ...state,
      isFetching: false,
    }),
  },
  initialState,
);
