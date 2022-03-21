import { createBrowserHistory } from "history";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import "./styles.css";

import { configureStore } from "~/redux/configureStore";
import Routes from "~/Routes";

const history = createBrowserHistory();
const store = configureStore(history);

render(
  <Provider store={store}>
    <Routes history={history} />
  </Provider>,
  document.getElementById("app"),
);
