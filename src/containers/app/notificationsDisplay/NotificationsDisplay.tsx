import React from 'react';
import { connect } from 'react-redux';
import { css } from 'emotion';
import { dismissNotification } from '../../../redux/app/appActions';
import { selectNotifications } from '../../../redux/app/appSelectors';
import NotificationDisplay from './components/NotificationDisplay';
import { NotificationModel } from '../../../types/appTypes';
import { ReduxDispatch, ReduxState } from '../../../types/commonTypes';

interface ConnectStateProps {
  notifications: NotificationModel[];
}

interface ConnectDispatchProps {
  onDismissNotification: (notificationId: string) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

const NotificationsDisplayComponent: React.FunctionComponent<Props> = ({
  notifications,
  onDismissNotification,
}) => (
  <div
    className={css`
      align-items: center;
      bottom: 1rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0 auto;
      position: absolute;
      width: 100%;
    `}
  >
    {notifications.map(notification => (
      <NotificationDisplay
        key={notification.id}
        notification={notification}
        onDismiss={onDismissNotification}
      />
    ))}
  </div>
);

const mapStateToProps = (state: ReduxState) => ({
  notifications: selectNotifications(state),
});

const mapDispatchToProps = (dispatch: ReduxDispatch) => ({
  onDismissNotification: (notificationId: string) =>
    dispatch(dismissNotification(notificationId)),
});

export default connect<ConnectStateProps, ConnectDispatchProps>(
  mapStateToProps,
  mapDispatchToProps,
)(NotificationsDisplayComponent);
