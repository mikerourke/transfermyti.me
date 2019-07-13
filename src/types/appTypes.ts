import { EntityGroup } from "~/types/entityTypes";

export enum NotificationType {
  Error = "danger",
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

export interface InTransferDetailsModel {
  countCurrentInGroup: number;
  countTotalInGroup: number;
  entityGroup: EntityGroup | null;
  workspaceId: string | null;
}

export interface TransferCountsModel {
  countCurrent: number;
  countTotal: number;
}

export interface AggregateTransferCountsModel {
  countCurrentInWorkspace: number;
  countTotalInWorkspace: number;
  countCurrentOverall: number;
  countTotalOverall: number;
}
