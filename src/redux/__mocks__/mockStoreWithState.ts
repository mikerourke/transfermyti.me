import { ActionCreator, Middleware } from "redux";
import configureStore, { MockStore } from "redux-mock-store";
import createSagaMiddleware from "redux-saga";
import { default as stateFixture } from "../__fixtures__/state";

export { MockStoreCreator, MockStore } from "redux-mock-store";

// This is the same as ReduxAction, but the type was changed to `any`, otherwise
// we'd have to explicitly specify every action `type` name when using jest-in-case:
export interface ReduxTestAction<TPayload = {}> {
  type: any;
  payload?: TPayload;
  error?: boolean;
  meta?: any;
}

export type ReduxTestActionCreator<TPayload> = ActionCreator<
  ReduxTestAction<TPayload>
  >;

// This is done to simplify the imports in tests (rather than have to import
// state/fixtures from the state.ts file and mockStoreWithState() function from
// another:
export const state = stateFixture;

/**
 * Creates an instance of a Redux store for mocking in tests.
 * @param stateChanges Updated entries in state (doesn't have to be entire state
 *                     since state fixture is used.
 * @param additionalMiddleware Any other middlewares to pass to configureStore
 *                             function.
 */
export function mockStoreWithState<TState>(
  stateChanges?: TState,
  additionalMiddleware: Array<Middleware> = [],
): MockStore {
  const sagaMiddleware = createSagaMiddleware();
  const mockStore = configureStore([sagaMiddleware, ...additionalMiddleware]);
  const validState = { ...stateFixture, ...stateChanges };
  return mockStore(validState);
}
