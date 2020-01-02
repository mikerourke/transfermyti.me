import { createSelector } from "reselect";
import * as R from "ramda";
import { capitalize } from "~/utils";
import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";
import { ReduxState } from "~/redux/reduxTypes";
import {
  NotificationModel,
  RoutePath,
  ToolHelpDetailsModel,
  ToolNameByMappingModel,
} from "./appTypes";

export const currentPathSelector = (state: ReduxState): string =>
  state.router.location.pathname;

const routePathValues = Object.values(RoutePath);

export const currentTransferStepSelector = createSelector(
  currentPathSelector,
  (currentPath): number => routePathValues.indexOf(currentPath as RoutePath),
);

export const notificationsSelector = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): NotificationModel[] => notifications,
);

export const toolNameByMappingSelector = (
  state: ReduxState,
): ToolNameByMappingModel => state.app.toolNameByMapping;

export const mappingByToolNameSelector = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping): Record<ToolName, Mapping> =>
    R.invertObj(
      (toolNameByMapping as unknown) as { [mapping: string]: string },
    ) as Record<ToolName, Mapping>,
);

export const toolHelpDetailsByMappingSelector = createSelector(
  toolNameByMappingSelector,
  (toolNameByMapping): Record<Mapping, ToolHelpDetailsModel> => {
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
        displayName: capitalize(toolName),
        toolLink: findToolLink(toolName),
      };
    }

    return toolHelpDetailsByMapping;
  },
);
