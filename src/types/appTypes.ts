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

export interface InTransferDetailsModel {
  countTotal: number;
  countCurrent: number;
  entityGroup: EntityGroup | null;
  workspaceId: string | null;
}
