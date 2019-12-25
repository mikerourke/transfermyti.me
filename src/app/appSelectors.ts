import { createSelector } from "reselect";
import { capitalize } from "~/utils";
import { Mapping, ToolName, TransferMappingModel } from "~/common/commonTypes";
import { ReduxState } from "~/redux/reduxTypes";
import { NotificationModel, RoutePath, ToolHelpDetailsModel } from "./appTypes";

export const selectCurrentPath = (state: ReduxState): string =>
  state.router.location.pathname;

export const selectCurrentTransferStep = createSelector(
  selectCurrentPath,
  (currentPath): number =>
    Object.values(RoutePath).indexOf(currentPath as RoutePath),
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
  (_: unknown, toolName: ToolName) => toolName,
  (transferMapping, toolName) => {
    const matchedIndex = Object.values(transferMapping).indexOf(toolName);
    if (matchedIndex === 0) {
      return Mapping.Source;
    }

    if (matchedIndex === 1) {
      return Mapping.Target;
    }

    return null;
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
