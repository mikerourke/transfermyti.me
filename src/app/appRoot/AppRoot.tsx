import React from "react";
import { Helmet } from "react-helmet";
import { ThemeProvider } from "emotion-theming";
import { Global } from "@emotion/core";
import { styled, theme } from "~/components/emotion";
import NotificationsDisplay from "~/app/notificationsDisplay/NotificationsDisplay";
import Header from "./Header";
import Footer from "./Footer";

const Main = styled.main({
  height: "calc(100vh - 9rem)",
  margin: "0 auto",
  maxWidth: "56rem",
  overflowY: "auto",
  padding: "0 1.5rem 1.5rem",
  position: "relative",
});

const GlobalStyles: React.FC = () => (
  <Global
    styles={{
      "*": {
        boxSizing: "border-box",
        fontFamily: theme.fonts.body,

        "&:before, &:after": {
          boxSizing: "border-box",
        },
      },

      html: {
        boxSizing: "border-box",
        height: "100%",
      },

      body: {
        backgroundColor: theme.colors.secondary,
        color: theme.colors.primary,
        lineHeight: theme.lineHeights.body,
        margin: 0,
        position: "relative",
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

      ul: {
        margin: 0,
      },
    }}
  />
);

const AppRoot: React.FC = props => {
  const description = "Transfer your data between time tracking tools.";
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
        <link href="manifest.json" rel="manifest" />
      </Helmet>
      <GlobalStyles />
      <Header />
      <Main role="main">{props.children}</Main>
      <NotificationsDisplay />
      <Footer />
    </ThemeProvider>
  );
};

export default AppRoot;
