import { ToolName } from "~/common/commonTypes";

export enum NotificationType {
  Error = "error",
  Info = "info",
  Success = "success",
}

export interface NotificationModel {
  id: string;
  message: string;
  type: NotificationType;
}

export enum TransferType {
  MultipleUsers = "MULTIPLE",
  SingleUser = "SINGLE",
}

export interface AggregateTransferCountsModel {
  countCurrentInWorkspace: number;
  countTotalInWorkspace: number;
  countCurrentOverall: number;
  countTotalOverall: number;
}

export enum RoutePath {
  TransferType = "/transfer-type",
  Credentials = "/credentials",
  Workspaces = "/workspaces",
  ReviewSource = "/review-source",
  ReviewTarget = "/review-target",
  PerformTransfer = "/perform-transfer",
}

export interface ToolHelpDetailsModel {
  toolName: ToolName;
  displayName: string;
  toolLink: string;
}
