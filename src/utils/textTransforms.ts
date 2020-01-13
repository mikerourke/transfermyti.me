import * as R from "ramda";
import { EntityGroup } from "~/typeDefs";

export function booleanToYesNo(value: boolean | string): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return value;
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

export function getEntityGroupDisplay(entityGroup: EntityGroup | null): string {
  if (entityGroup === null) {
    return "None";
  }

  switch (entityGroup) {
    case EntityGroup.TimeEntries:
      return "Time Entries";

    case EntityGroup.UserGroups:
      return "User Groups";

    default:
      return capitalize(entityGroup as string);
  }
}

export function kebabCase(value: string): string {
  // Removes all punctuation and leaves only letters.
  // @see https://stackoverflow.com/a/4328546
  const cleanValue = value.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");

  return cleanValue.toLowerCase().replace(/\s+/g, "-");
}
