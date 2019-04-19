import { EntityGroup } from '~/types/entityTypes';

export enum NotificationType {
  Error = 'danger',
  Info = 'info',
  Success = 'success',
}

export interface NotificationModel {
  id: string;
  message: string;
  type: NotificationType;
}

export enum TransferType {
  MultipleUsers = 'MULTIPLE',
  SingleUser = 'SINGLE',
}

export interface InTransferDetailsModel<TRecord = {}> {
  countTotal: number;
  countCurrent: number;
  entityGroup: EntityGroup | null;
  entityRecord: TRecord | null;
  workspaceId: string | null;
}

type InTransferGroupKey =
  | EntityGroup.Projects
  | EntityGroup.Tags
  | EntityGroup.Clients
  | EntityGroup.Tasks
  | EntityGroup.TimeEntries;

export type InTransferDetailsByGroupModel = Record<
  InTransferGroupKey,
  InTransferDetailsModel
>;
