import React, { Component } from 'react';
import { css } from 'emotion';
import { Delete, Notification } from 'bloomer';
import { NotificationModel } from '../../../../types/appTypes';

interface Props {
  notification: NotificationModel;
  onDismiss: (notificationId: string) => void;
}

class NotificationDisplay extends Component<Props> {
  public componentDidMount(): void {
    setTimeout(() => {
      this.props.onDismiss(this.props.notification.id);
    }, 5000);
  }

  private handleDeleteClick = () => {
    this.props.onDismiss(this.props.notification.id);
  };

  public render() {
    const { id, type, message } = this.props.notification;
    return (
      <Notification
        isColor={type}
        className={css`
          font-size: 1.25rem;
          font-weight: bold;
        `}
      >
        <Delete onClick={this.handleDeleteClick} />
        {message}
      </Notification>
    );
  }
}

export default NotificationDisplay;
