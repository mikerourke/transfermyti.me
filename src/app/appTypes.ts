import { Mapping, ToolName } from "~/allEntities/allEntitiesTypes";

type NotificationType = "error" | "info" | "success";

export interface NotificationModel {
  id: string;
  message: string;
  type: NotificationType;
}

export enum RoutePath {
  PickToolAction = "/pick-tool-action",
  EnterApiKeys = "/enter-api-keys",
  SelectWorkspaces = "/select-workspaces",
  SelectInclusions = "/select-inclusions",
  PerformToolAction = "/perform-tool-action",
}

export enum ToolAction {
  None = "none",
  Delete = "delete",
  Transfer = "transfer",
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
