import { createBrowserHistory } from "history";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import "./styles.css";

import { getStore } from "~/redux/configureStore";
import Routes from "~/Routes";

const history = createBrowserHistory();
const store = getStore();

render(
  <Provider store={store}>
    <Routes history={history} />
  </Provider>,
  document.getElementById("app"),
);
