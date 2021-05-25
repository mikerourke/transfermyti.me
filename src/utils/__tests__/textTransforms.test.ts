import cases from "jest-in-case";

import * as textTransforms from "../textTransforms";
import { EntityGroup } from "~/typeDefs";

describe("within textTransforms", () => {
  describe("the booleanToYesNo method", () => {
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

  describe("the capitalize method", () => {
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

  describe("the getEntityGroupDisplay method", () => {
    cases(
      "returns the correct display based on the entityGroup arg",
      (options) => {
        const result = textTransforms.getEntityGroupDisplay(
          options.entityGroup,
        );

        expect(result).toBe(options.expected);
      },
      [
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
      ],
    );

    test(`returns "None" if entityGroup arg is null`, () => {
      const result = textTransforms.getEntityGroupDisplay(null);

      expect(result).toBe("None");
    });
  });

  describe("the kebabCase method", () => {
    test("returns the kebab case value for simple value", () => {
      const result = textTransforms.kebabCase("Do Stuff");

      expect(result).toBe("do-stuff");
    });

    test("returns the kebab case value for value with special characters", () => {
      const result = textTransforms.kebabCase("Do Stuff123!!&^");

      expect(result).toBe("do-stuff123");
    });
  });
});
