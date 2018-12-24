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
