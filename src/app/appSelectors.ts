import * as R from "ramda";
import { createSelector } from "reselect";
import { capitalize } from "~/utils";
import {
  Mapping,
  ToolName,

} from "~/common/commonTypes";
import { ReduxState } from "~/redux/reduxTypes";
import {
  NotificationModel,
  RoutePath,
  ToolHelpDetailsModel,
  ToolNameByMappingModel,
} from "./appTypes";

export const selectCurrentPath = (state: ReduxState): string =>
  state.router.location.pathname;

const routePathValues = Object.values(RoutePath);

export const selectCurrentTransferStep = createSelector(
  selectCurrentPath,
  (currentPath): number => routePathValues.indexOf(currentPath as RoutePath),
);

export const selectNotifications = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): NotificationModel[] => notifications,
);

export const selectToolNameByMapping = (
  state: ReduxState,
): ToolNameByMappingModel => state.app.toolNameByMapping;

export const selectMappingByToolName = createSelector(
  selectToolNameByMapping,
  (toolNameByMapping): Record<ToolName, Mapping> =>
    R.invertObj(
      (toolNameByMapping as unknown) as { [mapping: string]: string },
    ) as Record<ToolName, Mapping>,
);

export const selectMappingForTool = createSelector(
  selectMappingByToolName,
  (_: ReduxState, toolName: ToolName) => toolName,
  (mappingByToolName, toolName) => mappingByToolName[toolName] ?? null,
);

export const selectCurrentTransferCount = (state: ReduxState): number =>
  state.app.currentTransferCount;

export const selectTotalTransferCount = (state: ReduxState): number =>
  state.app.totalTransferCount;

export const selectToolHelpDetailsByMapping = createSelector(
  selectToolNameByMapping,
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
