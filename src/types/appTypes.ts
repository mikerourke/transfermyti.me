import { CompoundEntityModel } from '~/types/commonTypes';

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

export interface TransferDetailsModel {
  countCurrent: number;
  countTotal: number;
  inTransferEntity: Partial<CompoundEntityModel> | null;
}
