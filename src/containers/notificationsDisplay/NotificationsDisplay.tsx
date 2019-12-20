import React from "react";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { dismissNotification } from "~/app/appActions";
import { selectNotifications } from "~/app/appSelectors";
import { Flex } from "~/components";
import NotificationDisplay from "./NotificationDisplay";
import { NotificationModel } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

const Root = styled(Flex)({
  bottom: "1rem",
  margin: "0 auto",
  position: "absolute",
  width: "100%",
});

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
  <Root alignItems="center" justifyContent="center" direction="column">
    {notifications.map(notification => (
      <NotificationDisplay
        key={notification.id}
        notification={notification}
        onDismiss={onDismissNotification}
      />
    ))}
  </Root>
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
