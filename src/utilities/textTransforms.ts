import { isEmpty, isNil } from "ramda";

import { EntityGroup } from "~/typeDefs";

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
