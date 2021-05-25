import { Global, ThemeProvider } from "@emotion/react";
import Color from "color";
import React from "react";
import { Helmet } from "react-helmet";

import Footer from "./Footer";
import Header from "./Header";
import NotificationsDisplay from "~/app/notificationsDisplay/NotificationsDisplay";
import { styled, theme as customTheme } from "~/components/emotion";

const Main = styled.main(
  {
    height: "calc(100vh - 10rem)",
    margin: "0 auto",
    maxWidth: "56rem",
    overflowY: "auto",
    padding: "0 1.5rem 1.5rem",
    position: "relative",
  },
  ({ theme }) => ({
    [theme.query.mobile]: {
      padding: "0 0.375rem 1.5rem",
    },
  }),
);

const GlobalStyles: React.FC = () => (
  <Global
    styles={{
      "*": {
        boxSizing: "border-box",
        fontFamily: customTheme.fonts.body,

        "&:before, &:after": {
          boxSizing: "border-box",
        },
      },

      html: {
        boxSizing: "border-box",
        height: "100%",
      },

      body: {
        backgroundColor: customTheme.colors.secondary,
        color: customTheme.colors.primary,
        lineHeight: customTheme.lineHeights.body,
        margin: 0,
        position: "relative",
      },

      "#app": {
        margin: "0 auto",
        minHeight: "100vh",
      },

      a: {
        color: customTheme.colors.primary,
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

const AppRoot: React.FC = (props) => {
  const author = "Mike Rourke";
  const description = "Transfer your data between time tracking tools.";
  const title = "transfermyti.me";
  const cardImageUrl = "https://transfermyti.me/logo-card.png";

  const primaryColor = Color(customTheme.colors.primary).hex();
  const secondaryColor = Color(customTheme.colors.secondary).hex();

  return (
    <ThemeProvider theme={customTheme}>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <meta name="author" content={author} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta name="og:description" content={description} />
        <meta name="og:image" content={cardImageUrl} />
        <meta name="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://transfermyti.me" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={cardImageUrl} />
        <meta name="twitter:image:width" content="600" />
        <meta name="twitter:image:height" content="600" />
        <meta name="twitter:site" content="@codelikeawolf" />
        <meta name="twitter:creator" content="@codelikeawolf" />
        <meta
          name="keywords"
          content={["toggl", "clockify", "transfer"].join(",")}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content={primaryColor} />
        <meta name="theme-color" content={secondaryColor} />
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
