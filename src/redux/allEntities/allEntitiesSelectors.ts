import { invertObj } from "ramda";

import { createSelector } from "~/redux/reduxTools";
import {
  EntityGroup,
  FetchStatus,
  Mapping,
  ToolAction,
  ToolName,
  type AnyEntity,
  type CountsByEntityGroup,
  type ReduxState,
  type ToolHelpDetails,
  type ToolNameByMapping,
} from "~/typeDefs";
import { capitalize, getEntityGroupDisplay } from "~/utilities/textTransforms";

export const areExistsInTargetShownSelector = createSelector(
  (state: ReduxState) => state.allEntities.areExistsInTargetShown,
  (areExistsInTargetShown): boolean => areExistsInTargetShown,
);

export const fetchAllFetchStatusSelector = createSelector(
  (state: ReduxState) => state.allEntities.fetchAllFetchStatus,
  (fetchAllFetchStatus): FetchStatus => fetchAllFetchStatus,
);

export const pushAllChangesFetchStatusSelector = createSelector(
  (state: ReduxState) => state.allEntities.pushAllChangesFetchStatus,
  (pushAllChangesFetchStatus): FetchStatus => pushAllChangesFetchStatus,
);

export const toolActionSelector = createSelector(
  (state: ReduxState) => state.allEntities.toolAction,
  (toolAction): ToolAction => toolAction,
);

export const toolNameByMappingSelector = createSelector(
  (state: ReduxState) => state.allEntities.toolNameByMapping,
  (toolNameByMapping): ToolNameByMapping => toolNameByMapping,
);

export const entityGroupInProcessDisplaySelector = createSelector(
  (state: ReduxState) => state.allEntities.entityGroupInProcess,
  (entityGroupInProcess): string =>
    getEntityGroupDisplay(entityGroupInProcess).toLowerCase(),
);

export const transferCountsByEntityGroupSelector = createSelector(
  (state: ReduxState) => state.allEntities.transferCountsByEntityGroup,
  (transferCountsByEntityGroup): CountsByEntityGroup =>
    transferCountsByEntityGroup,
);

const findLengthOfIncluded = (
  entityRecordsById: Dictionary<AnyEntity>,
): number =>
  Object.values(entityRecordsById).filter(
    (entityRecord) => entityRecord.isIncluded,
  ).length;

export const includedCountsByEntityGroupSelector = createSelector(
  (state: ReduxState) => state.clients.source,
  (state: ReduxState) => state.projects.source,
  (state: ReduxState) => state.tags.source,
  (state: ReduxState) => state.tasks.source,
  (state: ReduxState) => state.timeEntries.source,
  (
    sourceClientsById,
    sourceProjectsById,
    sourceTagsById,
    sourceTasksById,
    sourceTimeEntriesById,
  ): CountsByEntityGroup => ({
    [EntityGroup.Clients]: findLengthOfIncluded(sourceClientsById),
    [EntityGroup.Projects]: findLengthOfIncluded(sourceProjectsById),
    [EntityGroup.Tags]: findLengthOfIncluded(sourceTagsById),
    [EntityGroup.Tasks]: findLengthOfIncluded(sourceTasksById),
    [EntityGroup.TimeEntries]: findLengthOfIncluded(sourceTimeEntriesById),
    [EntityGroup.UserGroups]: 0,
    [EntityGroup.Users]: 0,
  }),
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
    invertObj(
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
  ): Record<Mapping, ToolHelpDetails> => {
    const findToolLink = (toolName: ToolName): string => {
      if (toolName === ToolName.Clockify) {
        return "https://clockify.me/user/settings";
      } else {
        return "https://toggl.com/app/profile";
      }
    };

    const toolHelpDetailsByMapping: Record<Mapping, ToolHelpDetails> = {
      [Mapping.Source]: {} as ToolHelpDetails,
      [Mapping.Target]: {} as ToolHelpDetails,
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
    } else {
      return toolDisplayNameByMapping[Mapping.Target];
    }
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
