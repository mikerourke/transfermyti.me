declare function fetch(input: RequestInfo, init?: RequestInit): any;

declare module 'promise-throttle';
declare module 'redux-actions';

/**
 * The type definitions for redux, redux-thunk, and react-redux were causing a
 * ruckus, this fixes all of the stupid type errors.
 */
declare module 'redux-fixed' {
  export type ThunkAction<R, S, E> = (
    dispatch: Dispatch<S>,
    getState: () => S,
    extraArgument: E,
  ) => R;

  export interface Dispatch<S> {
    <R, E>(asyncAction: ThunkAction<R, S, E>): R;
  }
  export interface Dispatch<S> {
    <A>(action: A & { type: any }): A & { type: any };
  }
}
