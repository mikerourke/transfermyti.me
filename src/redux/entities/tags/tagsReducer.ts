import { getType } from "typesafe-actions";
import { combineActions, handleActions } from "redux-actions";
import { get } from "lodash";
import * as utils from "~/redux/utils";
import { togglTimeEntriesFetch } from "~/redux/entities/timeEntries/timeEntriesActions";
import * as tagsActions from "./tagsActions";
import {
  ClockifyTagModel,
  CompoundTagModel,
  EntitiesFetchPayloadModel,
  EntityGroup,
  ReduxAction,
  ReduxStateEntryForTool,
  TogglTagModel,
  TogglTimeEntryModel,
  ToolName,
} from "~/types";

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

export const tagsReducer = handleActions(
  {
    [combineActions(
      getType(tagsActions.clockifyTagsFetch.success),
      getType(tagsActions.clockifyTagsTransfer.success),
    )]: (
      state: TagsState,
      {
        payload: { entityRecords, workspaceId },
      }: ReduxAction<EntitiesFetchPayloadModel<ClockifyTagModel>>,
    ): TagsState => {
      const normalizedState = utils.normalizeState({
        toolName: ToolName.Clockify,
        entityGroup: EntityGroup.Tags,
        entityState: state,
        payload: entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(workspaceId),
      });

      return utils.linkEntitiesInStateByName(EntityGroup.Tags, normalizedState);
    },

    [getType(tagsActions.togglTagsFetch.success)]: (
      state: TagsState,
      {
        payload: { entityRecords, workspaceId },
      }: ReduxAction<EntitiesFetchPayloadModel<TogglTagModel>>,
    ): TagsState =>
      utils.normalizeState({
        toolName: ToolName.Toggl,
        entityGroup: EntityGroup.Tags,
        entityState: state,
        payload: entityRecords,
        schemaProcessStrategy: getSchemaProcessStrategy(workspaceId),
      }),

    [combineActions(
      getType(tagsActions.clockifyTagsFetch.request),
      getType(tagsActions.togglTagsFetch.request),
      getType(tagsActions.clockifyTagsTransfer.request),
    )]: (state: TagsState): TagsState => ({
      ...state,
      isFetching: true,
    }),

    [combineActions(
      getType(tagsActions.clockifyTagsFetch.success),
      getType(tagsActions.clockifyTagsFetch.failure),
      getType(tagsActions.togglTagsFetch.success),
      getType(tagsActions.togglTagsFetch.failure),
      getType(tagsActions.clockifyTagsTransfer.success),
      getType(tagsActions.clockifyTagsTransfer.failure),
    )]: (state: TagsState): TagsState => ({
      ...state,
      isFetching: false,
    }),

    [getType(tagsActions.flipIsTagIncluded)]: (
      state: TagsState,
      { payload: tagId }: ReduxAction<string>,
    ): TagsState => utils.flipEntityInclusion(state, tagId),

    [getType(togglTimeEntriesFetch.success)]: (
      state: TagsState,
      { payload: timeEntries }: ReduxAction<Array<TogglTimeEntryModel>>,
    ) => appendEntryCountByTagName(ToolName.Toggl, state, timeEntries),
  },
  initialState,
);

// TODO: Move this to transform class.
function appendEntryCountByTagName<TTimeEntry>(
  toolName: ToolName,
  state: TagsState,
  timeEntries: Array<TTimeEntry>,
) {
  const timeEntryCountByTagId = {};
  const tags = Object.values(state[toolName].byId);

  timeEntries.forEach(timeEntry => {
    const tagNames = get(timeEntry, "tagNames", []) as Array<string>;

    tagNames.forEach(tagName => {
      const { id = null } = tags.find(({ name }) => name === tagName);
      if (!id) return;

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
