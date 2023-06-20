import type { Selector } from "@reduxjs/toolkit";
import { readable, type Readable } from "svelte/store";

import { getStore } from "~/redux/store";
import type { ReduxState } from "~/types";

type StoreFromRedux<TReturn> = Readable<TReturn>;

export const dispatchAction = getStore().dispatch;

/**
 * Wraps a selector in a Svelte store, so you can refer to the value reactively
 * and only declare the variable once.
 * @param selector Selector to subscribe to for reactivity
 */
export function select<TReturn>(
  selector: Selector<ReduxState, TReturn>,
): StoreFromRedux<TReturn> {
  const reduxStore = getStore();

  return readable(
    // Make sure we're setting the initial value of the Svelte store to the
    // current value in state, otherwise we'll get undefined errors all over
    // the place:
    selector(reduxStore.getState()),

    // Create the Redux subscription that updates the Svelte store value
    // whenever it changes. This enables us to maintain a laser focus on only
    // updating the UI in response to changes to this particular slice of state,
    // and it eliminates a lot of extra boilerplate code:
    function start(set) {
      const unsubscribe = reduxStore.subscribe(() => {
        set(selector(reduxStore.getState()));
      });

      // As soon as we unsubscribe from the Svelte store, ensure we also
      // unsubscribe from the Redux store:
      return function stop() {
        unsubscribe();
      };
    },
  );
}
