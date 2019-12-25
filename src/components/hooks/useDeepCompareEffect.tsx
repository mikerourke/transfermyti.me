import React from "react";
import * as R from "ramda";

export function useDeepCompareEffect(
  callback: VoidFunction,
  deps: React.DependencyList,
): void {
  React.useEffect(callback, useDeepCompareMemoize(deps));
}

function useDeepCompareMemoize<TValue>(value: TValue): TValue {
  const ref = React.useRef<TValue>();

  if (!R.equals(value, ref.current)) {
    ref.current = value;
  }

  return ref.current as TValue;
}
