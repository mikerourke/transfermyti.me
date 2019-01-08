import React, { useEffect } from 'react';
import { Delete, Notification } from 'bloomer';
import { css } from 'emotion';
import { NotificationModel } from '../../../../types/appTypes';

interface Props {
  notification: NotificationModel;
  onDismiss: (notificationId: string) => void;
}

const NotificationDisplay: React.FunctionComponent<Props> = ({
  notification: { id, type, message },
  onDismiss,
}) => {
  useEffect(() => {
    setTimeout(() => {
      onDismiss(id);
    }, 5000);
  });

  return (
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
};

export default NotificationDisplay;
