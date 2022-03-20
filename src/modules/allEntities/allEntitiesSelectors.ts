import { createSelector } from "reselect";

import * as R from "ramda";

import {
  BaseEntityModel,
  CountsByEntityGroupModel,
  EntityGroup,
  FetchStatus,
  Mapping,
  ReduxState,
  ToolAction,
  ToolHelpDetailsModel,
  ToolName,
  ToolNameByMappingModel,
} from "~/typeDefs";
import { capitalize, getEntityGroupDisplay } from "~/utilities";

export const areExistsInTargetShownSelector = (state: ReduxState): boolean =>
  state.allEntities.areExistsInTargetShown;

export const fetchAllFetchStatusSelector = (state: ReduxState): FetchStatus =>
  state.allEntities.fetchAllFetchStatus;

export const pushAllChangesFetchStatusSelector = (
  state: ReduxState,
): FetchStatus => state.allEntities.pushAllChangesFetchStatus;

export const toolActionSelector = (state: ReduxState): ToolAction =>
  state.allEntities.toolAction;

export const toolNameByMappingSelector = (
  state: ReduxState,
): ToolNameByMappingModel => state.allEntities.toolNameByMapping;

export const entityGroupInProcessDisplaySelector = createSelector(
  (state: ReduxState) => state.allEntities.entityGroupInProcess,
  (entityGroupInProcess): string =>
    getEntityGroupDisplay(entityGroupInProcess).toLowerCase(),
);

export const transferCountsByEntityGroupSelector = createSelector(
  (state: ReduxState) => state.allEntities.transferCountsByEntityGroup,
  (transferCountsByEntityGroup): CountsByEntityGroupModel =>
    transferCountsByEntityGroup,
);

const findLengthOfIncluded = (
  entityRecordsById: Record<string, BaseEntityModel>,
): number =>
  Object.values(entityRecordsById).filter(
    (entityRecord) => entityRecord.isIncluded,
  ).length;

export const includedCountsByEntityGroupSelector = createSelector(
  (state: ReduxState) => state.clients.source,
  (state: ReduxState) => state.tags.source,
  (state: ReduxState) => state.projects.source,
  (state: ReduxState) => state.tasks.source,
  (state: ReduxState) => state.timeEntries.source,
  (
    sourceClientsById,
    sourceTagsById,
    sourceProjectsById,
    sourceTasksById,
    sourceTimeEntriesById,
  ): CountsByEntityGroupModel =>
    ({
      [EntityGroup.Clients]: findLengthOfIncluded(sourceClientsById),
      [EntityGroup.Tags]: findLengthOfIncluded(sourceTagsById),
      [EntityGroup.Projects]: findLengthOfIncluded(sourceProjectsById),
      [EntityGroup.Tasks]: findLengthOfIncluded(sourceTasksById),
      [EntityGroup.TimeEntries]: findLengthOfIncluded(sourceTimeEntriesById),
      [EntityGroup.UserGroups]: 0,
      [EntityGroup.Users]: 0,
    } as CountsByEntityGroupModel),
);

export const totalIncludedRecordsCountSelector = createSelector(
  includedCountsByEntityGroupSelector,
  (includedCountsByEntityGroup): number =>
    Object.values(includedCountsByEntityGroup).reduce(
      (acc, recordCount) => acc + recordCount,
      0,
    ),
);

export const toolForTargetMappingSelector = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping): ToolName => toolNameByMapping.target,
);

export const mappingByToolNameSelector = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping): Record<ToolName, Mapping> =>
    R.invertObj(
      toolNameByMapping as unknown as { [mapping: string]: string },
    ) as Record<ToolName, Mapping>,
);

export const replaceMappingWithToolNameSelector = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping) =>
    (label: string): string => {
      const { source, target } = toolNameByMapping;
      let updatedLabel = label;

      if (/source/gi.test(label)) {
        updatedLabel = updatedLabel.replace(/source/gi, capitalize(source));
      }

      if (/target/gi.test(label)) {
        updatedLabel = updatedLabel.replace(/target/gi, capitalize(target));
      }

      return updatedLabel;
    },
);

const toolDisplayNameByMappingSelector = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping): Record<Mapping, string> => ({
    [Mapping.Source]: capitalize(toolNameByMapping.source),
    [Mapping.Target]: capitalize(toolNameByMapping.target),
  }),
);

export const toolHelpDetailsByMappingSelector = createSelector(
  toolNameByMappingSelector,
  toolDisplayNameByMappingSelector,
  (
    toolNameByMapping,
    displayNameByMapping,
  ): Record<Mapping, ToolHelpDetailsModel> => {
    const findToolLink = (toolName: ToolName): string => {
      if (toolName === ToolName.Clockify) {
        return "https://clockify.me/user/settings";
      }
      return "https://toggl.com/app/profile";
    };

    const toolHelpDetailsByMapping: Record<Mapping, ToolHelpDetailsModel> = {
      [Mapping.Source]: {} as ToolHelpDetailsModel,
      [Mapping.Target]: {} as ToolHelpDetailsModel,
    };

    for (const [mapping, toolName] of Object.entries(toolNameByMapping)) {
      toolHelpDetailsByMapping[mapping] = {
        toolName,
        displayName: displayNameByMapping[mapping],
        toolLink: findToolLink(toolName),
      };
    }

    return toolHelpDetailsByMapping;
  },
);

export const targetToolDisplayNameSelector = createSelector(
  toolNameByMappingSelector,
  toolDisplayNameByMappingSelector,
  (toolNameByMapping, toolDisplayNameByMapping): string => {
    if (toolNameByMapping[Mapping.Target] === ToolName.None) {
      return toolDisplayNameByMapping[Mapping.Source];
    }

    return toolDisplayNameByMapping[Mapping.Target];
  },
);

export const targetToolTrackerUrlSelector = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping): string => {
    const validToolName =
      toolNameByMapping[Mapping.Target] === ToolName.None
        ? toolNameByMapping[Mapping.Source]
        : toolNameByMapping[Mapping.Target];

    if (validToolName === ToolName.Clockify) {
      return "https://clockify.me/tracker";
    }

    if (validToolName === ToolName.Toggl) {
      return "https://toggl.com/app/timer";
    }

    return "";
  },
);
