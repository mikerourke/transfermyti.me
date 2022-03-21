import { ThemeProvider } from "@emotion/react";
import React from "react";
import { Helmet } from "react-helmet";

import { theme as customTheme } from "~/components/emotion";
import Footer from "~/layout/Footer";
import Header from "~/layout/Header";
import NotificationsDisplay from "~/layout/NotificationsDisplay";

const AppRoot: React.FC = (props) => {
  const author = "Mike Rourke";
  const description = "Transfer your data between time tracking tools.";
  const title = "transfermyti.me";
  const cardImageUrl = "https://transfermyti.me/logo-card.png";

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
        <meta name="msapplication-TileColor" content="#1e78a1" />
        <meta name="theme-color" content="#effde8" />
      </Helmet>

      <Header />

      <main>{props.children}</main>

      <NotificationsDisplay />

      <Footer />
    </ThemeProvider>
  );
};

export default AppRoot;
