type ReduxDevToolsReduxAction = any;

type ReduxDevToolsReduxState = any;

/**
 * Allows you to specify if features should be enabled or disabled. If not
 * specified, all the features are enabled. When set as an object, only
 * those included as true will be allowed. Note that except true/false, import
 * and export can be set as "custom" (which is by default for Redux enhancer),
 * meaning that the importing/exporting occurs on the client side.
 * Otherwise, you'll get/set the data right from the monitor part.
 * @see https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md#features
 */
interface ReduxDevToolsFeaturesPropertyOptions {
  /** Start/pause recording of dispatched actions. */
  pause?: boolean;

  /** Lock/unlock dispatching actions and side effects. */
  lock?: boolean;

  /** Persist states on page reloading. */
  persist?: boolean;

  /** Export history of actions in a file. */
  export?: boolean;

  /** Import history of actions from a file. */
  import?: boolean | "custom";

  /** Jump back and forth (time travelling). */
  jump?: boolean;

  /** Skip (cancel) actions. */
  skip?: boolean;

  /** Drag and drop actions in the history list. */
  reorder?: boolean;

  /** Dispatch custom actions or action creators. */
  dispatch?: boolean;

  /** Generate tests for the selected actions. */
  test?: boolean;
}

/**
 * Represents the object, which contains keys for which to configure the
 * serialization behavior in Redux DevTools. For each of them you can indicate
 * if to include (by setting as true). For function key you can also specify a
 * custom function which handles serialization. See {@link https://github.com/kolodny/jsan} for more details.
 * @example
 *   const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__({
 *     serialize: {
 *       options: {
 *        undefined: true,
 *        function: function(fn) { return fn.toString() }
 *       }
 *     }
 *   }
 */
declare interface ReduxDevToolsSerializeOptionsPropertyOptions {
  date?: boolean;
  regex?: boolean;
  undefined?: boolean;
  nan?: boolean;
  infinity?: boolean;
  error?: boolean;
  symbol?: boolean;
  map?: boolean;
  set?: boolean;
  function?: boolean | ((fn: (...args: any[]) => void) => string);
}

/**
 * Options for the `serialize` option for Redux DevTools.
 * @see https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md#serialize
 */
declare interface ReduxDevToolsSerializeOptions {
  /**
   * Options for serializing types based on the setting.
   * ┌────────────┬──────────────────────────────────────────────────────┐
   * │ Option     │ Description                                          │
   * ├────────────┼──────────────────────────────────────────────────────┤
   * │ undefined  │ Will use regular JSON.stringify to send data         │
   * │            │ (it's the fast mode).                                │
   * ├────────────┼──────────────────────────────────────────────────────┤
   * │ false      │ Will handle also circular references.                │
   * ├────────────┼──────────────────────────────────────────────────────┤
   * │ true       │ Will handle also date, regex, undefined, primitives, │
   * │            │ error objects, symbols, maps, sets and functions.    │
   * ├────────────┼──────────────────────────────────────────────────────┤
   * │ object     │ See `ReduxDevToolsSerializeOptionsPropertyOptions`   │
   * └────────────┴──────────────────────────────────────────────────────┘
   */
  options?: boolean | ReduxDevToolsSerializeOptionsPropertyOptions | undefined;

  /**
   * JSON replacer function used for both actions and states stringify.
   * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter
   */
  replacer?: (key: string, value: unknown) => string;

  /**
   * JSON reviver function used for parsing the imported actions and states.
   * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter
   */
  reviver?: (key: string, value: unknown) => Record<string, unknown>;

  /**
   * Automatically serialize/deserialize ImmutableJS via remotedev-serialize.
   * Note: Only use this if using the ImmutableJS library.
   */
  immutable?: any;

  /**
   * ImmutableJS Record classes used to make possible restore its instances back
   * when importing, persisting.
   * Note: Only use this if using the ImmutableJS library.
   */
  refs?: any[];
}

/**
 * Options to pass to the Redux DevTools compose function.
 * @see https://github.com/zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md
 */
declare interface ReduxDevToolsComposeOptions {
  /**
   * The instance name to be shown on the monitor page. Default value is
   * document.title. If not specified and there's no document title, it will
   * consist of tabId and instanceId.
   */
  name?: string;

  /**
   * Action creators functions to be available in the Dispatcher.
   */
  actionCreators?: any | any[];

  /**
   * If more than one action is dispatched in the indicated interval, all new
   * actions will be collected and sent at once. It is the joint between
   * performance and speed. When set to 0, all actions will be sent instantly.
   * Set it to a higher value when experiencing perf issues (also maxAge to
   * a lower value).
   * @default 500
   */
  latency?: number;

  /**
   * Maximum allowed actions to be stored in the history tree. The oldest
   * actions are removed once maxAge is reached. It's critical for performance.
   * @default 50
   */
  maxAge?: number;

  /**
   * If set to true, will include stack trace for every dispatched action,
   * so you can see it in trace tab jumping directly to that part of code.
   * You can use a function (with action object as argument) which should
   * return new Error().stack string, getting the stack outside of reducers.
   * @default false
   */
  trace?: boolean | (() => void);

  /**
   * Maximum stack trace frames to be stored (in case trace option was provided
   * as true). By default, it's 10. Note that, because extension's calls are
   * excluded, the resulted frames could be 1 less. If trace option is a
   * function, traceLimit will have no effect, as it's supposed to be handled
   * there.
   */
  traceLimit?: number;

  /**
   * Options for serialization/deserialization.
   */
  serialize?: ReduxDevToolsSerializeOptions;

  /**
   * Function which takes action object as argument, and should return action
   * object back.
   */
  actionSanitizer?: (
    action: ReduxDevToolsReduxAction,
  ) => ReduxDevToolsReduxAction;

  /**
   * Function which takes state object as argument, and should return state
   * object back.
   */
  stateSanitizer?: (state: ReduxDevToolsReduxState) => ReduxDevToolsReduxState;

  /**
   * Action types to be hidden in the monitors (while passed to the reducers).
   */
  actionsBlacklist?: string | string[];

  /**
   * Action types to be shown in the monitors (while passed to the reducers).
   */
  actionsWhitelist?: string | string[];

  /**
   * Called for every action before sending, takes state and action object, and
   * returns true in case it allows sending the current data to the monitor.
   * Use it as a more advanced version of actionsBlacklist/actionsWhitelist
   * parameters.
   */
  predicate?: (
    state: ReduxDevToolsReduxState,
    action: ReduxDevToolsReduxAction,
  ) => boolean;

  /**
   * If specified as false, it will not record the changes till clicking on
   * Start recording button. Default is true. Available only for Redux
   * enhancer, for others use autoPause.
   */
  shouldRecordChanges?: boolean;

  /**
   * If specified, whenever clicking on Pause recording button and there are
   * actions in the history log, will add this action type. If not specified,
   * will commit when paused. Available only for Redux enhancer.
   * @default @@PAUSED.
   */
  pauseActionType?: string;

  /**
   * Auto pauses when the extension’s window is not opened, and so has zero
   * impact on your app when not in use. Not available for Redux enhancer
   * (as it already does it but storing the data to be sent).
   * @default false
   */
  autoPause?: boolean;

  /**
   * If specified as true, it will not allow any non-monitor actions to be
   * dispatched until clicking on Unlock changes button. Available only for
   * Redux enhancer.
   * @default false
   */
  shouldStartLocked?: boolean;

  /**
   * If set to false, will not recompute the states on hot reloading (or on
   * replacing the reducers). Available only for Redux enhancer.
   * @default true
   */
  shouldHotReload?: boolean;

  /**
   * If specified as true, whenever there's an exception in reducers, the
   * monitors will show the error message, and next actions will not be
   * dispatched.
   */
  shouldCatchErrors?: boolean;

  /**
   * Specify features to enable/disable.
   */
  features?: ReduxDevToolsFeaturesPropertyOptions;
}
