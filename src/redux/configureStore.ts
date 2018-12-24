import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { getStorage } from '../utils/storageUtils';
import reducers from './rootReducer';

const devTools = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const composeEnhancers: any = devTools || compose;

export default function configureStore() {
  const middleware = [thunkMiddleware];

  const storage = getStorage();

  return createStore(
    reducers,
    { credentials: storage },
    composeEnhancers(applyMiddleware(...middleware)),
  );
}
