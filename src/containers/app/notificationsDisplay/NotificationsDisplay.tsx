import React from "react";
import { connect } from "react-redux";
import { css } from "emotion";
import { dismissNotification } from "~/redux/app/appActions";
import { selectNotifications } from "~/redux/app/appSelectors";
import Flex from "~/components/Flex";
import NotificationDisplay from "./components/NotificationDisplay";
import { NotificationModel, ReduxState } from "~/types";

interface ConnectStateProps {
  notifications: Array<NotificationModel>;
}

interface ConnectDispatchProps {
  onDismissNotification: (notificationId: string) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

const NotificationsDisplayComponent: React.FC<Props> = ({
  notifications,
  onDismissNotification,
}) => (
  <Flex
    alignItems="center"
    justifyContent="center"
    direction="column"
    className={css({
      bottom: "1rem",
      margin: "0 auto",
      position: "absolute",
      width: "100%",
    })}
  >
    {notifications.map(notification => (
      <NotificationDisplay
        key={notification.id}
        notification={notification}
        onDismiss={onDismissNotification}
      />
    ))}
  </Flex>
);

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  notifications: selectNotifications(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onDismissNotification: dismissNotification,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(NotificationsDisplayComponent);
