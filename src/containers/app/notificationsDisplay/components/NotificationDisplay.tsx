import React from 'react';
import { css, keyframes } from 'emotion';
import { Delete, Notification } from 'bloomer';
import { NotificationModel } from '../../../../types/app';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const fadeOutDown = keyframes`
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    transform: translate3d(0, 100%, 0);
  }
`;

interface Props {
  notification: NotificationModel;
  onDismiss: (notificationId: string) => void;
}

interface State {
  activeAnimation: string;
}

class NotificationDisplay extends React.Component<Props, State> {
  state = {
    activeAnimation: fadeInUp,
  };

  private handleCloseClick = () => {
    this.setState({ activeAnimation: fadeOutDown });
    setTimeout(() => this.props.onDismiss(this.props.notification.id), 900);
  };

  public render() {
    const { notification } = this.props;

    return (
      <Notification
        isColor={notification.type}
        className={css`
          font-size: 1.25rem;
          font-weight: bold;
          animation: ${this.state.activeAnimation} 1s;
        `}
      >
        <Delete onClick={this.handleCloseClick} />
        {notification.message}
      </Notification>
    );
  }
}

export default NotificationDisplay;
