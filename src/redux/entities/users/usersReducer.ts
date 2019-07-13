import { getType } from "typesafe-actions";
import { combineActions, handleActions } from "redux-actions";
import { get } from "lodash";
import * as utils from "~/redux/utils";
import { togglTimeEntriesFetch } from "~/redux/entities/timeEntries/timeEntriesActions";
import * as usersActions from "./usersActions";
import {
  ClockifyUserModel,
  CompoundUserModel,
  EntitiesFetchPayloadModel,
  EntityGroup,
  EntityType,
  ReduxAction,
  ReduxStateEntryForTool,
  TogglTimeEntryModel,
  TogglUserModel,
  ToolName,
} from "~/types";

export interface UsersState {
  readonly clockify: ReduxStateEntryForTool<CompoundUserModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundUserModel>;
  readonly isFetching: boolean;
}

export const initialState: UsersState = {
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

const getSchemaProcessStrategy = (workspaceId: string) => (
  value: ClockifyUserModel | TogglUserModel,
): CompoundUserModel => ({
  id: value.id.toString(),
  name: "fullname" in value ? value.fullname : value.name,
  email: value.email,
  isAdmin: get(value, "admin", null),
  isActive: "status" in value ? value.status === "ACTIVE" : true,
  userGroupIds: "userGroupIds" in value ? value.userGroupIds : [],
  workspaceId,
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
  memberOf: EntityGroup.Users,
});

export const usersReducer = handleActions(
  {
    [combineActions(
      getType(usersActions.clockifyUsersFetch.success),
      getType(usersActions.clockifyUsersTransfer.success),
    )]: (
      state: UsersState,
      {
        payload: { entityRecords, workspaceId },
      }: ReduxAction<EntitiesFetchPayloadModel<ClockifyUserModel>>,
    ): UsersState => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Users,
        entityState: state,
        payload: entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(workspaceId),
      });

      return utils.linkEntitiesInStateByName(
        EntityGroup.Users,
        normalizedState,
      );
    },

    [getType(usersActions.togglUsersFetch.success)]: (
      state: UsersState,
      {
        payload: { entityRecords, workspaceId },
      }: ReduxAction<EntitiesFetchPayloadModel<TogglUserModel>>,
    ): UsersState =>
      utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.Users,
        entityState: state,
        payload: entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(workspaceId),
      }),

    [combineActions(
      getType(usersActions.clockifyUsersFetch.request),
      getType(usersActions.togglUsersFetch.request),
      getType(usersActions.clockifyUsersTransfer.request),
    )]: (state: UsersState): UsersState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(usersActions.clockifyUsersFetch.success),
      getType(usersActions.clockifyUsersFetch.failure),
      getType(usersActions.togglUsersFetch.success),
      getType(usersActions.togglUsersFetch.failure),
      getType(usersActions.clockifyUsersTransfer.success),
      getType(usersActions.clockifyUsersTransfer.failure),
    )]: (state: UsersState): UsersState => ({
      ...state,
      isFetching: false,
    }),

    [getType(usersActions.flipIsUserIncluded)]: (
      state: UsersState,
      { payload: userId }: ReduxAction<string>,
    ): UsersState => utils.flipEntityInclusion(state, userId),

    [getType(togglTimeEntriesFetch.success)]: (
      state: UsersState,
      { payload: timeEntries }: ReduxAction<Array<TogglTimeEntryModel>>,
    ) =>
      utils.appendEntryCountToState({
        entityType: EntityType.User,
        toolName: ToolName.Toggl,
        entityState: state,
        timeEntries,
      }),
  },
  initialState,
);
