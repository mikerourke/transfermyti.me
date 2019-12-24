import React from "react";
import { connect } from "react-redux";
import { Notification } from "rsuite";
import styled from "@emotion/styled";
import { capitalize } from "~/utils";
import { dismissNotification } from "~/app/appActions";
import { selectNotifications } from "~/app/appSelectors";
import Footer from "./Footer";
import Header from "./Header";
import { NotificationModel } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

const Main = styled.main({
  margin: "0 auto",
  maxWidth: "56rem",
  overflowY: "auto",
  padding: "0 1.5rem 1.5rem",
  position: "relative",
});

export interface ConnectStateProps {
  notifications: NotificationModel[];
}

export interface ConnectDispatchProps {
  onDismissNotification: (notificationId: string) => void;
}

type Props = ConnectStateProps & ConnectDispatchProps;

export const AppRootComponent: React.FC<Props> = props => {
  React.useEffect(() => {
    if (props.notifications.length !== 0) {
      for (const { id, type, message } of props.notifications) {
        Notification[type]({
          key: id,
          title: capitalize(type),
          duration: 20_000,
          description: message,
          onClose: () => props.onDismissNotification(id),
        });
      }
    }
  }, [props.notifications]);

  return (
    <>
      <Header />
      <Main>{props.children}</Main>
      <Footer />
    </>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  notifications: selectNotifications(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onDismissNotification: dismissNotification,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppRootComponent);
