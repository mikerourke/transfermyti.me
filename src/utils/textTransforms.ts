import * as R from "ramda";

export function booleanToYesNo(value: boolean): string {
  return value ? "Yes" : "No";
}

export function capitalize(value: string): string {
  if (R.or(R.isNil(value), R.isEmpty(value))) {
    return "";
  }

  return value
    .charAt(0)
    .toUpperCase()
    .concat(value.slice(1));
}

export function kebabCase(value: string): string {
  // Removes all punctuation and leaves only letters.
  // @see https://stackoverflow.com/a/4328546
  const cleanValue = value.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");

  return cleanValue.toLowerCase().replace(/\s+/g, "-");
}
