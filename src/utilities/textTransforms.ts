import { isEmpty, isNil } from "ramda";

import { EntityGroup } from "~/typeDefs";

/**
 * Converts the specified boolean or string value to the "Yes"/"No"
 * representation.
 */
export function booleanToYesNo(value: boolean | string): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return value;
}

/**
 * Capitalizes the first word of the specified value (if defined).
 */
export function capitalize(value: string | null): string {
  if (isNil(value) || isEmpty(value)) {
    return "";
  }

  return value.charAt(0).toUpperCase().concat(value.slice(1));
}

/**
 * Returns the display name of the specified entity group.
 */
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

/**
 * Converts the specified value to kebab-case.
 */
export function kebabCase(value: string): string {
  // Removes all punctuation and leaves only letters.
  // @see https://stackoverflow.com/a/4328546
  const cleanValue = value.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");

  return cleanValue.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Stringifies the specified value if it is valid, otherwise falls back to the
 * default value.
 */
export function validStringify<TDefault>(
  value: string | number | null | undefined,
  defaultIfNil: TDefault,
): TDefault {
  if (isNil(value)) {
    return defaultIfNil;
  }

  try {
    return value.toString() as unknown as TDefault;
  } catch {
    return defaultIfNil;
  }
}
