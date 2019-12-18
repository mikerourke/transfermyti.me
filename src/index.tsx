import "whatwg-fetch";
import "bulma/css/bulma.min.css";
import "react-virtualized/styles.css";
import "react-sweet-progress/lib/style.css";
import React from "react";
import { render } from "react-dom";
import { AnyAction } from "redux";
import { Provider } from "react-redux";
import { configureStore } from "./redux/configureStore";
import { validateCredentials } from "./redux/credentials/credentialsActions";
import { initInterceptor } from "./utils/httpInterceptor";
import App from "./containers/app/appContainer/App";

const store = configureStore();

initInterceptor(store);

updateCredentialsForDebug().then(renderApp);

async function updateCredentialsForDebug(): Promise<void> {
  try {
    if (process.env.USE_LOCAL_API === "true") {
      await store.dispatch(validateCredentials() as AnyAction);
    }
  } catch {
    // Do nothing.
  }
}

function renderApp(): void {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById("root"),
  );
}
