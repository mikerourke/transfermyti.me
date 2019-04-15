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

export interface TimeEntryTransferDetailsModel {
  countCurrent: number;
  countTotal: number;
  projectName: string;
  workspaceName: string;
}
