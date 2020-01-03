import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";

type NotificationType = "error" | "info" | "success";

export interface NotificationModel {
  id: string;
  message: string;
  type: NotificationType;
}

export enum RoutePath {
  PickTransferMapping = "/pick-transfer-mapping",
  EnterApiKeys = "/enter-api-keys",
  SelectWorkspaces = "/select-workspaces",
  SelectTransferData = "/select-transfer-data",
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
