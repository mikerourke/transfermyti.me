import React from "react";
import { connect } from "react-redux";
import { ThemeProvider } from "emotion-theming";
import { Global } from "@emotion/core";
import { dismissNotification } from "~/app/appActions";
import { notificationsSelector } from "~/app/appSelectors";
import { theme, styled } from "~/components/emotion";
import Footer from "./Footer";
import Header from "./Header";
import { NotificationModel } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

const Main = styled.main({
  height: "calc(100vh - 8rem)",
  margin: "0 auto",
  maxWidth: "56rem",
  overflowY: "scroll",
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
    // TODO: Add notification functionality back in.
  }, [props.notifications]);

  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={{
          "*": {
            fontFamily: theme.fonts.body,
            boxSizing: "inherit",

            "&:before, &:after": {
              boxSizing: "inherit",
            },
          },

          html: {
            boxSizing: "border-box",
            height: "100%",
          },

          body: {
            color: theme.colors.black,
            backgroundColor: theme.colors.alabaster,
            lineHeight: theme.lineHeights.body,
            position: "relative",
            margin: 0,
            overflow: "hidden",
          },

          "#root": {
            margin: "0 auto",
            minHeight: "100vh",
          },

          a: {
            color: theme.colors.cornflower,
          },

          h1: {
            fontWeight: 400,
          },

          "h1,h2,h3,h4,h5,h6,p": {
            margin: "1rem 0",
          },
        }}
      />
      <Header />
      <Main role="main">{props.children}</Main>
      <Footer />
    </ThemeProvider>
  );
};

const mapStateToProps = (state: ReduxState): ConnectStateProps => ({
  notifications: notificationsSelector(state),
});

const mapDispatchToProps: ConnectDispatchProps = {
  onDismissNotification: dismissNotification,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppRootComponent);
