import { createSelector } from "reselect";
import * as R from "ramda";
import {
  Mapping,
  ToolName,
  ToolNameByMappingModel,
} from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { capitalize } from "~/utils";
import {
  NotificationModel,
  RoutePath,
  ToolAction,
  ToolHelpDetailsModel,
} from "./appTypes";

export const currentPathSelector = (state: ReduxState): RoutePath =>
  state.router.location.pathname as RoutePath;

export const notificationsSelector = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): NotificationModel[] => notifications,
);

export const toolNameByMappingSelector = (
  state: ReduxState,
): ToolNameByMappingModel => state.app.toolNameByMapping;

export const toolActionSelector = (state: ReduxState): ToolAction =>
  state.app.toolAction;

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
