import { createSelector } from "reselect";
import * as R from "ramda";
import { getEntityGroupDisplay, capitalize } from "~/utils";
import { includedSourceClientsSelector } from "~/clients/clientsSelectors";
import { includedSourceProjectsSelector } from "~/projects/projectsSelectors";
import { includedSourceTagsSelector } from "~/tags/tagsSelectors";
import { includedSourceTasksSelector } from "~/tasks/tasksSelectors";
import { includedSourceTimeEntriesSelector } from "~/timeEntries/timeEntriesSelectors";
import {
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

export const areExistsInTargetShownSelector = (state: ReduxState): boolean =>
  state.allEntities.areExistsInTargetShown;

export const fetchAllFetchStatusSelector = (state: ReduxState): FetchStatus =>
  state.allEntities.fetchAllFetchStatus;

export const pushAllChangesFetchStatusSelector = (
  state: ReduxState,
): FetchStatus => state.allEntities.pushAllChangesFetchStatus;

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

export const includedCountsByEntityGroupSelector = createSelector(
  includedSourceClientsSelector,
  includedSourceTagsSelector,
  includedSourceProjectsSelector,
  includedSourceTasksSelector,
  includedSourceTimeEntriesSelector,
  (
    sourceClients,
    sourceTags,
    sourceProjects,
    sourceTasks,
    sourceTimeEntries,
  ): CountsByEntityGroupModel =>
    ({
      [EntityGroup.Clients]: sourceClients.length,
      [EntityGroup.Tags]: sourceTags.length,
      [EntityGroup.Projects]: sourceProjects.length,
      [EntityGroup.Tasks]: sourceTasks.length,
      [EntityGroup.TimeEntries]: sourceTimeEntries.length,
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

export const toolNameByMappingSelector = (
  state: ReduxState,
): ToolNameByMappingModel => state.allEntities.toolNameByMapping;

export const toolForTargetMappingSelector = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping): ToolName => toolNameByMapping.target,
);

export const toolActionSelector = (state: ReduxState): ToolAction =>
  state.allEntities.toolAction;

export const mappingByToolNameSelector = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping): Record<ToolName, Mapping> =>
    R.invertObj(
      (toolNameByMapping as unknown) as { [mapping: string]: string },
    ) as Record<ToolName, Mapping>,
);

export const replaceMappingWithToolNameSelector = createSelector(
  toolNameByMappingSelector,
  toolNameByMapping => (label: string): string => {
    const { source, target } = toolNameByMapping;

    if (/source/gi.test(label)) {
      return label.replace(/source/gi, capitalize(source));
    }

    if (/target/gi.test(label)) {
      return label.replace(/target/gi, capitalize(target));
    }

    return label;
  },
);

export const toolDisplayNameByMapping = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping): Record<Mapping, string> => ({
    source: capitalize(toolNameByMapping.source),
    target: capitalize(toolNameByMapping.target),
  }),
);

export const toolHelpDetailsByMappingSelector = createSelector(
  toolNameByMappingSelector,
  toolDisplayNameByMapping,
  (
    toolNameByMapping,
    displayNameByMapping,
  ): Record<Mapping, ToolHelpDetailsModel> => {
    const findToolLink = (toolName: ToolName): string =>
      ({
        [ToolName.Clockify]: "https://clockify.me/user/settings",
        [ToolName.Toggl]: "https://toggl.com/app/profile",
      }[toolName]);

    const toolHelpDetailsByMapping: Record<Mapping, ToolHelpDetailsModel> = {
      source: {} as ToolHelpDetailsModel,
      target: {} as ToolHelpDetailsModel,
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
