import React from "react";
import { Helmet } from "react-helmet";
import { connect } from "react-redux";
import { ThemeProvider } from "emotion-theming";
import { Global } from "@emotion/core";
import { dismissNotification } from "~/app/appActions";
import { notificationsSelector } from "~/app/appSelectors";
import { styled, theme } from "~/components/emotion";
import Header from "./Header";
import Footer from "./Footer";
import { NotificationModel } from "~/app/appTypes";
import { ReduxState } from "~/redux/reduxTypes";

const Main = styled.main({
  height: "calc(100vh - 8rem)",
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
    // TODO: Add notification functionality back in.
  }, [props.notifications]);

  const description = "Transfer your time entries between time tracking tools.";
  const title = "transfermyti.me";

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta name="og:description" content={description} />
        <meta name="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="Mike Rourke" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta
          name="keywords"
          content={["toggl", "clockify", "transfer"].join(",")}
        />
      </Helmet>
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
            color: theme.colors.primary,
            backgroundColor: theme.colors.secondary,
            lineHeight: theme.lineHeights.body,
            position: "relative",
            margin: 0,
          },

          "#app": {
            margin: "0 auto",
            minHeight: "100vh",
          },

          a: {
            color: theme.colors.primary,
            cursor: "pointer",
            textDecoration: "none",

            "&:hover,&:focus": {
              textDecoration: "underline",
            },
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
