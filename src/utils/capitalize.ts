import * as R from "ramda";

export function capitalize(value: string): string {
  if (R.or(R.isNil(value), R.isEmpty(value))) {
    return "";
  }

  return value
    .charAt(0)
    .toUpperCase()
    .concat(value.slice(1));
}
