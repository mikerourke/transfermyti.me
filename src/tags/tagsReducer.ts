import { createReducer, ActionType } from "typesafe-actions";
import { get } from "lodash";
import * as utils from "~/utils";
import { togglTimeEntriesFetch } from "~/timeEntries/timeEntriesActions";
import * as tagsActions from "./tagsActions";
import { EntityGroup, ToolName } from "~/common/commonTypes";
import { ReduxStateEntryForTool } from "~/redux/reduxTypes";
import {
  ClockifyTagModel,
  CompoundTagModel,
  TogglTagModel,
} from "~/tags/tagsTypes";

type TagsAction = ActionType<typeof tagsActions & typeof togglTimeEntriesFetch>;

export interface TagsState {
  readonly clockify: ReduxStateEntryForTool<CompoundTagModel>;
  readonly toggl: ReduxStateEntryForTool<CompoundTagModel>;
  readonly isFetching: boolean;
}

export const initialState: TagsState = {
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
  value: ClockifyTagModel | TogglTagModel,
): CompoundTagModel => ({
  id: value.id.toString(),
  name: value.name,
  workspaceId,
  entryCount: 0,
  linkedId: null,
  isIncluded: true,
  memberOf: EntityGroup.Tags,
});

export const tagsReducer = createReducer<TagsState, TagsAction>(initialState)
  .handleAction(
    [
      tagsActions.clockifyTagsFetch.success,
      tagsActions.clockifyTagsTransfer.success,
    ],
    (state, { payload }) => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Tags,
        entityState: state,
        payload: payload.entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
      });

      const linkedState = utils.linkEntitiesInStateByName(
        EntityGroup.Tags,
        normalizedState,
      );
      return { ...linkedState, isFetching: false };
    },
  )
  .handleAction(tagsActions.togglTagsFetch.success, (state, { payload }) => {
    const normalizedState = utils.normalizeState({
      toolName: ToolName.Toggl,
      entityGroup: EntityGroup.Tags,
      entityState: state,
      payload: payload.entityRecords,
      schemaProcessStrategy: getSchemaProcessStrategy(payload.workspaceId),
    });
    return { ...normalizedState, isFetching: false };
  })
  .handleAction(
    [
      tagsActions.clockifyTagsFetch.request,
      tagsActions.clockifyTagsTransfer.request,
      tagsActions.togglTagsFetch.request,
    ],
    state => ({
      ...state,
      isFetching: true,
    }),
  )
  .handleAction(
    [
      tagsActions.clockifyTagsFetch.failure,
      tagsActions.clockifyTagsTransfer.failure,
      tagsActions.togglTagsFetch.failure,
    ],
    state => ({
      ...state,
      isFetching: false,
    }),
  )
  .handleAction(tagsActions.flipIsTagIncluded, (state, { payload }) =>
    utils.flipEntityInclusion(state, payload),
  )
  .handleAction(togglTimeEntriesFetch.success, (state, { payload }) =>
    appendEntryCountByTagName(ToolName.Toggl, state, payload),
  );

// TODO: Move this to transform class.
function appendEntryCountByTagName<TTimeEntry>(
  toolName: ToolName,
  state: TagsState,
  timeEntries: Array<TTimeEntry>,
): TagsState {
  const timeEntryCountByTagId = {};
  const tags = Object.values(state[toolName].byId);

  timeEntries.forEach(timeEntry => {
    const tagNames = get(timeEntry, "tagNames", []) as Array<string>;

    tagNames.forEach(tagName => {
      const { id = null } = tags.find(({ name }) => name === tagName);
      if (!id) {
        return;
      }

      const existingCount = get(timeEntryCountByTagId, id, 0);
      timeEntryCountByTagId[id] = existingCount + 1;
    });
  });

  const updatedTagsById = tags.reduce(
    (acc, tag) => ({
      ...acc,
      [tag.id]: {
        ...tag,
        entryCount: tag.entryCount + get(timeEntryCountByTagId, tag.id, 0),
      },
    }),
    {},
  );

  return {
    ...state,
    [toolName]: {
      ...state[toolName],
      byId: updatedTagsById,
    },
  };
}
