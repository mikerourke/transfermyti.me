import { describe, expect, test } from "vitest";

import { EntityGroup } from "~/typeDefs";

import * as textTransforms from "../textTransforms";

describe("within textTransforms", () => {
  describe("the booleanToYesNo function", () => {
    test(`returns "Yes" if the value arg is boolean and true`, () => {
      const result = textTransforms.booleanToYesNo(true);

      expect(result).toBe("Yes");
    });

    test(`returns "No" if the value arg is boolean and false`, () => {
      const result = textTransforms.booleanToYesNo(false);

      expect(result).toBe("No");
    });

    test(`returns the value if the value arg is not a boolean`, () => {
      const result = textTransforms.booleanToYesNo("Nope");

      expect(result).toBe("Nope");
    });
  });

  describe("the capitalize function", () => {
    test("returns the capitalized value arg if valid", () => {
      const result = textTransforms.capitalize("test");

      expect(result).toBe("Test");
    });

    test("returns an empty string if value arg is null", () => {
      const result = textTransforms.capitalize(null);

      expect(result).toBe("");
    });

    test("returns an empty string if value arg is empty", () => {
      const result = textTransforms.capitalize("");

      expect(result).toBe("");
    });
  });

  describe("the getEntityGroupDisplay function", () => {
    const testCases = [
      {
        name: "when the entity group is TimeEntries",
        entityGroup: EntityGroup.TimeEntries,
        expected: "Time Entries",
      },
      {
        name: "when the entity group is UserGroups",
        entityGroup: EntityGroup.UserGroups,
        expected: "User Groups",
      },
      {
        name: "when the entity group is Clients",
        entityGroup: EntityGroup.Clients,
        expected: "Clients",
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = textTransforms.getEntityGroupDisplay(testCase.entityGroup);

        expect(result).toBe(testCase.expected);
      });
    }

    test(`returns "None" if entityGroup arg is null`, () => {
      const result = textTransforms.getEntityGroupDisplay(null);

      expect(result).toBe("None");
    });
  });

  describe("the kebabCase function", () => {
    test("returns the kebab case value for simple value", () => {
      const result = textTransforms.kebabCase("Do Stuff");

      expect(result).toBe("do-stuff");
    });

    test("returns the kebab case value for value with special characters", () => {
      const result = textTransforms.kebabCase("Do Stuff123!!&^");

      expect(result).toBe("do-stuff123");
    });
  });

  describe("the validStringify function", () => {
    test("returns the default if the specified value is null", () => {
      const result = textTransforms.validStringify(null, "Default");

      expect(result).toBe("Default");
    });

    test("returns the stringified value of a number", () => {
      const result = textTransforms.validStringify(123, "");

      expect(result).toBe("123");
    });

    test("returns the stringified value of a string", () => {
      const result = textTransforms.validStringify("test", "");

      expect(result).toBe("test");
    });
  });
});
