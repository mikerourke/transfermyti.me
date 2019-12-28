import { Mapping, ToolName } from "~/entities/entitiesTypes";

type NotificationType = "error" | "info" | "success";

export interface NotificationModel {
  id: string;
  message: string;
  type: NotificationType;
}

export enum RoutePath {
  TransferMapping = "/transfer-mapping",
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

export interface ToolNameByMappingModel {
  [Mapping.Source]: ToolName;
  [Mapping.Target]: ToolName;
}
