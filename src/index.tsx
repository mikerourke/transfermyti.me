import "whatwg-fetch";
import { createBrowserHistory } from "history";
import React from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";

import { configureStore } from "./redux/configureStore";
import Routes from "./Routes";
import { initInterceptor } from "./utils/httpInterceptor";
import { initAnalytics } from "./utils/initAnalytics";

const history = createBrowserHistory();
const store = configureStore(history);

initInterceptor(store);
initAnalytics();

render(
  <Provider store={store}>
    <Routes history={history} />
  </Provider>,
  document.getElementById("app"),
);
