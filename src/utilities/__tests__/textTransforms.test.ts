import { describe, expect, test } from "vitest";

import { EntityGroup } from "~/typeDefs";

import * as textTransforms from "../textTransforms";

describe("within textTransforms", () => {
  describe("the capitalize function", () => {
    const testCases = [
      {
        name: "returns the capitalized value arg if valid",
        value: "test",
        expected: "Test",
      },
      {
        name: "returns an empty string if value arg is null",
        value: null,
        expected: "",
      },
      {
        name: "returns an empty string if value arg is empty",
        value: "",
        expected: "",
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = textTransforms.capitalize(testCase.value);

        expect(result).toBe(testCase.expected);
      });
    }
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

  describe("the validStringify function", () => {
    const testCases = [
      {
        name: "returns the default if the specified value is null",
        value: null,
        defaultIfNil: "Default",
        expected: "Default",
      },
      {
        name: "returns the stringified value of a number",
        value: 123,
        defaultIfNil: "",
        expected: "123",
      },
      {
        name: "returns an empty string if value arg is empty",
        value: "test",
        defaultIfNil: "",
        expected: "test",
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = textTransforms.validStringify(testCase.value, testCase.defaultIfNil);

        expect(result).toBe(testCase.expected);
      });
    }
  });
});
