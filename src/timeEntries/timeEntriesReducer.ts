import { createReducer, ActionType } from "typesafe-actions";
import { get } from "lodash";
import * as utils from "~/utils";
import { flipIsProjectIncluded } from "~/projects/projectsActions";
import { flipIsTaskIncluded } from "~/tasks/tasksActions";
import { flipIsUserIncluded } from "~/users/usersActions";
import { updateIsWorkspaceYearIncluded } from "~/workspaces/workspacesActions";
import * as timeEntriesActions from "./timeEntriesActions";
import { EntityGroup, ToolName } from "~/common/commonTypes";
import { ReduxStateEntryForTool } from "~/redux/reduxTypes";
import { CompoundTimeEntryModel } from "./timeEntriesTypes";

type TimeEntriesAction = ActionType<
  | typeof timeEntriesActions
  | typeof flipIsProjectIncluded
  | typeof flipIsTaskIncluded
  | typeof flipIsUserIncluded
  | typeof updateIsWorkspaceYearIncluded
>;

export interface TimeEntriesState {
  readonly clockify: ReduxStateEntryForTool<CompoundTimeEntryModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundTimeEntryModel>;
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

export const timeEntriesReducer = createReducer<
  TimeEntriesState,
  TimeEntriesAction
>(initialState)
  .handleAction(
    [
      timeEntriesActions.clockifyTimeEntriesFetch.success,
      timeEntriesActions.clockifyTimeEntriesTransfer.success,
    ],
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.TimeEntries,
        entityState: state,
        payload,
      });
      return { ...normalizedState, isFetching: false };
    },
  )
  .handleAction(
    timeEntriesActions.togglTimeEntriesFetch.success,
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.TimeEntries,
        entityState: state,
        payload,
      });
      return { ...normalizedState, isFetching: false };
    },
  )
  .handleAction(
    [
      timeEntriesActions.clockifyTimeEntriesFetch.request,
      timeEntriesActions.clockifyTimeEntriesTransfer.request,
      timeEntriesActions.togglTimeEntriesFetch.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      timeEntriesActions.clockifyTimeEntriesFetch.failure,
      timeEntriesActions.clockifyTimeEntriesTransfer.failure,
      timeEntriesActions.togglTimeEntriesFetch.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(
    timeEntriesActions.flipIsTimeEntryIncluded,
    (state, { payload }) => utils.flipEntityInclusion(state, payload),
  )
  .handleAction(
    timeEntriesActions.addLinksToTimeEntries,
    (state, { payload }) => ({
      ...state,
      ...payload,
    }),
  )
  .handleAction(flipIsProjectIncluded, (state, { payload }) =>
    pushInclusionFlipToTimeEntry({
      state,
      parentIdFieldName: "projectId",
      parentId: payload,
    }),
  )
  .handleAction(flipIsTaskIncluded, (state, { payload }) =>
    pushInclusionFlipToTimeEntry({
      state,
      parentIdFieldName: "taskId",
      parentId: payload,
    }),
  )
  .handleAction(flipIsUserIncluded, (state, { payload }) =>
    pushInclusionFlipToTimeEntry({
      state,
      parentIdFieldName: "userId",
      parentId: payload,
    }),
  )
  .handleAction(updateIsWorkspaceYearIncluded, (state, { payload }) => {
    const updatedEntriesById = Object.entries(state.toggl.byId).reduce(
      (acc, [timeEntryId, timeEntry]) => {
        let isIncludedToUse = timeEntry.isIncluded;

        if (
          timeEntry.workspaceId === payload.workspaceId &&
          +timeEntry.year === +payload.year
        ) {
          isIncludedToUse = payload.isIncluded;
        }

        return {
          ...acc,
          [timeEntryId]: {
            ...timeEntry,
            isIncluded: isIncludedToUse,
          },
        };
      },
      {},
    );

    return {
      ...state,
      toggl: {
        ...state.toggl,
        byId: updatedEntriesById,
      },
    };
  });

function pushInclusionFlipToTimeEntry({
  state,
  parentIdFieldName,
  parentId,
}: {
  state: TimeEntriesState;
  parentIdFieldName: string;
  parentId: string;
}): TimeEntriesState {
  const timeEntriesById = { ...state.toggl.byId };

  const updatedEntriesById = Object.entries(timeEntriesById).reduce(
    (acc, [timeEntryId, { isIncluded, ...timeEntry }]) => ({
      ...acc,
      [timeEntryId]: {
        ...timeEntry,
        isIncluded:
          get(timeEntry, parentIdFieldName) === parentId
            ? !isIncluded
            : isIncluded,
      },
    }),
    {},
  );

  return {
    ...state,
    toggl: {
      ...state.toggl,
      byId: updatedEntriesById,
    },
  };
}
