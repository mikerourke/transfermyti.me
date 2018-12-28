import React from 'react';
import { css } from 'emotion';
import { Delete, Notification } from 'bloomer';
import { NotificationModel } from '../../../../types/appTypes';

interface Props {
  notification: NotificationModel;
  onDismiss: (notificationId: string) => void;
}

const NotificationDisplay: React.FunctionComponent<Props> = ({
  notification: { id, type, message },
  onDismiss,
}) => (
  <Notification
    isColor={type}
    className={css`
      font-size: 1.25rem;
      font-weight: bold;
    `}
  >
    <Delete onClick={() => onDismiss(id)} />
    {message}
  </Notification>
);

export default NotificationDisplay;
