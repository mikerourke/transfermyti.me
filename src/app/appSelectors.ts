import { createSelector } from "reselect";
import * as R from "ramda";
import { capitalize } from "~/utils";
import { Mapping, ToolName, TransferMappingModel } from "~/common/commonTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { NotificationModel, RoutePath, ToolHelpDetailsModel } from "./appTypes";

export const selectCurrentPath = (state: ReduxState): string =>
  state.router.location.pathname;

const routePathValues = Object.values(RoutePath);

export const selectCurrentTransferStep = createSelector(
  selectCurrentPath,
  (currentPath): number => routePathValues.indexOf(currentPath as RoutePath),
);

export const selectIfPastValidationStep = createSelector(
  selectCurrentTransferStep,
  currentTransferStep =>
    currentTransferStep > routePathValues.indexOf(RoutePath.Credentials),
);

export const selectNotifications = createSelector(
  (state: ReduxState) => state.app.notifications,
  (notifications): NotificationModel[] => notifications,
);

export const selectTransferMapping = (
  state: ReduxState,
): TransferMappingModel => state.app.transferMapping;

export const selectToolMapping = createSelector(
  selectTransferMapping,
  (_: ReduxState, toolName: ToolName) => toolName,
  (transferMapping, toolName) => {
    const mappingByTool = R.invertObj(
      (transferMapping as unknown) as { [tool: string]: string },
    );
    return mappingByTool[toolName] ?? null;
  },
);

export const selectCurrentTransferCount = (state: ReduxState): number =>
  state.app.currentTransferCount;

export const selectTotalTransferCount = (state: ReduxState): number =>
  state.app.totalTransferCount;

export const selectToolHelpDetailsByMapping = createSelector(
  selectTransferMapping,
  (transferMapping): Record<Mapping, ToolHelpDetailsModel> => {
    const findToolLink = (toolName: ToolName): string =>
      ({
        [ToolName.Clockify]: "https://clockify.me/user/settings",
        [ToolName.Toggl]: "https://toggl.com/app/profile",
      }[toolName]);

    return Object.entries(transferMapping).reduce(
      (acc, [mapping, toolName]) => ({
        ...acc,
        [mapping]: {
          toolName,
          displayName: capitalize(toolName),
          toolLink: findToolLink(toolName),
        },
      }),
      {} as Record<Mapping, ToolHelpDetailsModel>,
    );
  },
);
