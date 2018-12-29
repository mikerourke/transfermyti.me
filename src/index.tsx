import 'whatwg-fetch';
import 'bulma/css/bulma.min.css';
import 'react-virtualized/styles.css';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './redux/configureStore';
import initInterceptor from './utils/httpInterceptor';
import App from './containers/app/appContainer/App';

const store = configureStore();

initInterceptor(store);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
