import { combineActions, handleActions } from 'redux-actions';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import ReduxEntity from '../../../utils/ReduxEntity';
import {
  clockifyTimeEntriesFetchFailure,
  clockifyTimeEntriesFetchStarted,
  clockifyTimeEntriesFetchSuccess,
  togglTimeEntriesFetchFailure,
  togglTimeEntriesFetchStarted,
  togglTimeEntriesFetchSuccess,
} from './timeEntriesActions';
import { EntityType, ToolName } from '../../../types/commonTypes';
import {
  ClockifyTimeEntry,
  TimeEntryModel,
  TogglTimeEntry,
} from '../../../types/timeEntriesTypes';
import { ReduxAction } from '../../rootReducer';

interface TimeEntriesEntryForTool {
  readonly timeEntriesById: Record<string, TimeEntryModel>;
  readonly timeEntryIds: string[];
}

export interface TimeEntriesState {
  readonly clockify: TimeEntriesEntryForTool;
  readonly toggl: TimeEntriesEntryForTool;
  readonly isFetching: boolean;
}

export const initialState: TimeEntriesState = {
  clockify: {
    timeEntriesById: {},
    timeEntryIds: [],
  },
  toggl: {
    timeEntriesById: {},
    timeEntryIds: [],
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
  projectId: ReduxEntity.getIdFieldValue(value, EntityType.Project),
  taskId: ReduxEntity.getIdFieldValue(value, EntityType.Task),
  userId: ReduxEntity.getIdFieldValue(value, EntityType.User),
  workspaceId: ReduxEntity.getIdFieldValue(value, EntityType.Workspace),
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
});

const reduxEntity = new ReduxEntity(
  EntityType.TimeEntry,
  schemaProcessStrategy,
);

export default handleActions(
  {
    [clockifyTimeEntriesFetchSuccess]: (
      state: TimeEntriesState,
      { payload }: ReduxAction<ClockifyTimeEntry[]>,
    ): TimeEntriesState =>
      reduxEntity.getNormalizedState<TimeEntriesState, ClockifyTimeEntry[]>(
        ToolName.Clockify,
        state,
        payload,
      ),

    [togglTimeEntriesFetchSuccess]: (
      state: TimeEntriesState,
      { payload }: ReduxAction<TogglTimeEntry[]>,
    ): TimeEntriesState =>
      reduxEntity.getNormalizedState<TimeEntriesState, TogglTimeEntry[]>(
        ToolName.Toggl,
        state,
        payload,
      ),

    [combineActions(
      clockifyTimeEntriesFetchStarted,
      togglTimeEntriesFetchStarted,
    )]: (state: TimeEntriesState): TimeEntriesState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      clockifyTimeEntriesFetchSuccess,
      clockifyTimeEntriesFetchFailure,
      togglTimeEntriesFetchSuccess,
      togglTimeEntriesFetchFailure,
    )]: (state: TimeEntriesState): TimeEntriesState => ({
      ...state,
      isFetching: false,
    }),
  },
  initialState,
);
