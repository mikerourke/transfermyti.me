import { createSelector } from "reselect";
import { capitalize } from "lodash";
import {
  EntityGroup,
  Mapping,
  ToolName,
  TransferMappingModel,
} from "~/common/commonTypes";
import { ReduxState } from "~/redux/reduxTypes";
import {
  AggregateTransferCountsModel,
  NotificationModel,
  RoutePath,
  ToolHelpDetailsModel,
} from "./appTypes";

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

export const selectCurrentEntityGroup = (
  state: ReduxState,
): EntityGroup | null => state.app.currentEntityGroup;

export const selectCurrentWorkspaceId = (state: ReduxState): string | null =>
  state.app.currentWorkspaceId;

export const selectCountCurrentInGroup = (state: ReduxState): number =>
  state.app.countCurrentInGroup;

export const selectCountTotalInGroup = (state: ReduxState): number =>
  state.app.countTotalInGroup;

export const selectCountCurrentInWorkspace = (state: ReduxState): number =>
  state.app.countCurrentInWorkspace;

export const selectCountTotalInWorkspace = (state: ReduxState): number =>
  state.app.countTotalInWorkspace;

export const selectCountCurrentOverall = (state: ReduxState): number =>
  state.app.countCurrentOverall;

export const selectCountTotalOverall = (state: ReduxState): number =>
  state.app.countTotalOverall;

export const selectAggregateTransferCounts = createSelector(
  selectCountCurrentInWorkspace,
  selectCountTotalInWorkspace,
  selectCountCurrentOverall,
  selectCountTotalOverall,
  (
    countCurrentInWorkspace,
    countTotalInWorkspace,
    countCurrentOverall,
    countTotalOverall,
  ): AggregateTransferCountsModel => ({
    countCurrentInWorkspace,
    countTotalInWorkspace,
    countCurrentOverall,
    countTotalOverall,
  }),
);

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
