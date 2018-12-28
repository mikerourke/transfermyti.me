import { handleActions, combineActions } from 'redux-actions';
import { normalize, schema } from 'normalizr';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import {
  clockifyTimeEntriesFetchStarted,
  clockifyTimeEntriesFetchSuccess,
  clockifyTimeEntriesFetchFailure,
  togglTimeEntriesFetchStarted,
  togglTimeEntriesFetchSuccess,
  togglTimeEntriesFetchFailure,
} from './timeEntriesActions';
import { TimeEntryModel } from '../../../types/timeEntriesTypes';

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

const getTimeValue = (value: any, field: string) => {
  const timeValue =
    'timeInterval' in value ? value.timeInterval[field] : value[field];
  return new Date(timeValue);
};

const getStringValue = (fieldValue: any) => {
  try {
    return isNil(fieldValue) ? null : fieldValue.toString();
  } catch (error) {
    return fieldValue;
  }
};

const timeEntriesSchema = new schema.Entity(
  'timeEntries',
  {},
  {
    idAttribute: value => value.id.toString(),
    processStrategy: value => ({
      id: value.id.toString(),
      description: value.description,
      projectId:
        'pid' in value
          ? value.pid.toString()
          : get(value, ['project', 'id'], null),
      taskId:
        'tid' in value
          ? getStringValue(value.tid)
          : get(value, ['task', 'id'], null),
      userId:
        'uid' in value
          ? value.uid.toString()
          : get(value, ['user', 'id'], null),
      workspaceId: 'wid' in value ? value.wid.toString() : value.workspaceId,
      client: isString(value.client)
        ? value.client
        : get(value, ['project', 'clientName'], null),
      isBillable: 'is_billable' in value ? value.is_billable : value.billable,
      start: getTimeValue(value, 'start'),
      end: getTimeValue(value, 'end'),
      tags: isNil(value.tags)
        ? []
        : value.tags.map((tag: any) =>
            isString(tag) ? tag : get(tag, 'name'),
          ),
      isIncluded: true,
    }),
  },
);

export default handleActions(
  {
    [clockifyTimeEntriesFetchSuccess]: (
      state: TimeEntriesState,
      { payload }: any,
    ): TimeEntriesState => {
      const { entities, result } = normalize(payload, [timeEntriesSchema]);
      return {
        ...state,
        clockify: {
          ...state.clockify,
          timeEntriesById: {
            ...state.clockify.timeEntriesById,
            ...entities.timeEntries,
          },
          timeEntryIds: [...state.clockify.timeEntryIds, ...result],
        },
      };
    },

    [togglTimeEntriesFetchSuccess]: (
      state: TimeEntriesState,
      { payload }: any,
    ): TimeEntriesState => {
      const { entities, result } = normalize(payload, [timeEntriesSchema]);
      return {
        ...state,
        toggl: {
          ...state.toggl,
          timeEntriesById: {
            ...state.toggl.timeEntriesById,
            ...entities.timeEntries,
          },
          timeEntryIds: [...state.toggl.timeEntryIds, ...result],
        },
      };
    },

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
