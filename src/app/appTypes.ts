import { ToolName } from "~/common/commonTypes";

type NotificationType = "error" | "info" | "success";

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
  PerformTransfer = "/perform-transfer",
}

export interface ToolHelpDetailsModel {
  toolName: ToolName;
  displayName: string;
  toolLink: string;
}
