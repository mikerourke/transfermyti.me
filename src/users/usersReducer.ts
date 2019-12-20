import { createReducer, ActionType } from "typesafe-actions";
import { get } from "lodash";
import * as utils from "~/utils";
import { togglTimeEntriesFetch } from "~/timeEntries/timeEntriesActions";
import * as usersActions from "./usersActions";
import { EntityGroup, EntityType, ToolName } from "~/commonTypes";
import { ReduxStateEntryForTool } from "~/redux/reduxTypes";
import {
  ClockifyUserModel,
  CompoundUserModel,
  TogglUserModel,
} from "./usersTypes";

type UsersAction = ActionType<
  typeof usersActions & typeof togglTimeEntriesFetch
>;

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

export const usersReducer = createReducer<UsersState, UsersAction>(initialState)
  .handleAction(
    [
      usersActions.clockifyUsersFetch.success,
      usersActions.clockifyUsersTransfer.success,
    ],
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Users,
        entityState: state,
        payload: payload.entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
      });

      const linkedState = utils.linkEntitiesInStateByName(
        EntityGroup.Users,
        normalizedState,
      );
      return { ...linkedState, isFetching: false };
    },
  )
  .handleAction(usersActions.togglUsersFetch.success, (state, { payload }) => {
    const normalizedState = utils.normalizeState({
      toolName: ToolName.Toggl,
      entityGroup: EntityGroup.Users,
      entityState: state,
      payload: payload.entityRecords,
      schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
    });
    return { ...normalizedState, isFetching: false };
  })
  .handleAction(
    [
      usersActions.clockifyUsersFetch.request,
      usersActions.clockifyUsersTransfer.request,
      usersActions.togglUsersFetch.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      usersActions.clockifyUsersFetch.failure,
      usersActions.clockifyUsersTransfer.failure,
      usersActions.togglUsersFetch.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(usersActions.flipIsUserIncluded, (state, { payload }) =>
    utils.flipEntityInclusion(state, payload),
  )
  .handleAction(togglTimeEntriesFetch.success, (state, { payload }) =>
    utils.appendEntryCountToState({
      entityType: EntityType.User,
      toolName: ToolName.Toggl,
      entityState: state,
      timeEntries: payload,
    }),
  );
