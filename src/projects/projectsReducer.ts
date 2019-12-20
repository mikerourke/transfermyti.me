import { createReducer, ActionType } from "typesafe-actions";
import { get } from "lodash";
import * as utils from "~/utils";
import { togglTimeEntriesFetch } from "~/timeEntries/timeEntriesActions";
import * as projectsActions from "./projectsActions";
import { EntityGroup, EntityType, ToolName } from "~/common/commonTypes";
import { ReduxStateEntryForTool } from "~/redux/reduxTypes";
import {
  ClockifyProjectModel,
  CompoundProjectModel,
  TogglProjectModel,
} from "./projectsTypes";

type ProjectsAction = ActionType<
  typeof projectsActions & typeof togglTimeEntriesFetch
>;

export interface ProjectsState {
  readonly clockify: ReduxStateEntryForTool<CompoundProjectModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundProjectModel>;
  readonly isFetching: boolean;
}

export const initialState: ProjectsState = {
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
  value: ClockifyProjectModel | TogglProjectModel,
): CompoundProjectModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId,
  clientId: utils.findIdFieldValue(value, EntityType.Client),
  isBillable: value.billable,
  isPublic: "public" in value ? value.public : !value.is_private,
  isActive: "archived" in value ? value.archived : value.active,
  color: "hex_color" in value ? value.hex_color : value.color,
  userIds: get(value, "userIds", []).map((userId: number) => userId.toString()),
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
  memberOf: EntityGroup.Projects,
});

export const projectsReducer = createReducer<ProjectsState, ProjectsAction>(
  initialState,
)
  .handleAction(
    [
      projectsActions.clockifyProjectsFetch.success,
      projectsActions.clockifyProjectsTransfer.success,
    ],
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Projects,
        entityState: state,
        payload: payload.entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
      });

      const linkedState = utils.linkEntitiesInStateByName(
        EntityGroup.Projects,
        normalizedState,
      );
      return { ...linkedState, isFetching: false };
    },
  )
  .handleAction(
    projectsActions.togglProjectsFetch.success,
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.Projects,
        entityState: state,
        payload: payload.entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
      });
      return { ...normalizedState, isFetching: false };
    },
  )
  .handleAction(
    [
      projectsActions.clockifyProjectsFetch.request,
      projectsActions.clockifyProjectsTransfer.request,
      projectsActions.togglProjectsFetch.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      projectsActions.clockifyProjectsFetch.failure,
      projectsActions.clockifyProjectsTransfer.failure,
      projectsActions.togglProjectsFetch.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(projectsActions.flipIsProjectIncluded, (state, { payload }) =>
    utils.flipEntityInclusion(state, payload),
  )
  .handleAction(togglTimeEntriesFetch.success, (state, { payload }) =>
    utils.appendEntryCountToState({
      entityType: EntityType.Project,
      toolName: ToolName.Toggl,
      entityState: state,
      timeEntries: payload,
    }),
  );
