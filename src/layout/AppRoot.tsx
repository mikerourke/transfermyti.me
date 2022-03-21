import { ThemeProvider } from "@emotion/react";
import React from "react";

import { theme as customTheme } from "~/components/emotion";
import Footer from "~/layout/Footer";
import Header from "~/layout/Header";
import NotificationsDisplay from "~/layout/NotificationsDisplay";

const AppRoot: React.FC = (props) => (
  <ThemeProvider theme={customTheme}>
    <Header />

    <main>{props.children}</main>

    <NotificationsDisplay />

    <Footer />
  </ThemeProvider>
);

export default AppRoot;
