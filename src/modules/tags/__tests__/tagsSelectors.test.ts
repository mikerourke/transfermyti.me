import cases from "jest-in-case";

import { state } from "~/redux/__mocks__/mockStoreWithState";
import { ToolName } from "~/typeDefs";

import * as tagsSelectors from "../tagsSelectors";

const TEST_STATE = {
  ...state,
  tags: {
    source: {
      "4001": {
        id: "4001",
        name: "tag-a",
        workspaceId: "1001",
        entryCount: 1,
        linkedId: "clock-tag-01",
        isIncluded: false,
        memberOf: "tags",
      },
      "4002": {
        id: "4002",
        name: "tag-b",
        workspaceId: "1001",
        entryCount: 1,
        linkedId: "clock-tag-02",
        isIncluded: false,
        memberOf: "tags",
      },
      "4003": {
        id: "4003",
        name: "tag-c",
        workspaceId: "1001",
        entryCount: 1,
        linkedId: "clock-tag-03",
        isIncluded: false,
        memberOf: "tags",
      },
      "4004": {
        id: "4004",
        name: "tag-d",
        workspaceId: "1001",
        entryCount: 0,
        linkedId: null,
        isIncluded: false,
        memberOf: "tags",
      },
      "4005": {
        id: "4005",
        name: "tag-e",
        workspaceId: "1001",
        entryCount: 0,
        linkedId: null,
        isIncluded: false,
        memberOf: "tags",
      },
      "4006": {
        id: "4006",
        name: "tag-f",
        workspaceId: "1001",
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: "tags",
      },
      "4007": {
        id: "4007",
        name: "tag-g",
        workspaceId: "1001",
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: "tags",
      },
      "4008": {
        id: "4008",
        name: "tag-h",
        workspaceId: "1001",
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: "tags",
      },
      "4009": {
        id: "4009",
        name: "tag-i",
        workspaceId: "1001",
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: "tags",
      },
    },
    target: {
      "clock-tag-01": {
        id: "clock-tag-01",
        name: "tag-a",
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "4001",
        isIncluded: false,
        memberOf: "tags",
      },
      "clock-tag-02": {
        id: "clock-tag-02",
        name: "tag-b",
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "4002",
        isIncluded: false,
        memberOf: "tags",
      },
      "clock-tag-03": {
        id: "clock-tag-03",
        name: "tag-c",
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "4003",
        isIncluded: false,
        memberOf: "tags",
      },
    },
    isFetching: false,
  },
};

describe("within tagsSelectors", () => {
  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(TEST_STATE);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "for the includedSourceTagsSelector",
        selector: tagsSelectors.includedSourceTagsSelector,
      },
      {
        name: "for the sourceTagsForTransferSelector",
        selector: tagsSelectors.sourceTagsForTransferSelector,
      },
      {
        name: "for the tagsTotalCountsByTypeSelector",
        selector: tagsSelectors.tagsTotalCountsByTypeSelector,
      },
    ],
  );

  cases(
    "the tagsForInclusionsTableSelector matches its snapshot based on state.allEntities.areExistsInTargetShown",
    (options) => {
      const updatedState = {
        ...TEST_STATE,
        allEntities: {
          ...TEST_STATE.allEntities,
          areExistsInTargetShown: options.areExistsInTargetShown,
        },
      };
      const result = tagsSelectors.tagsForInclusionsTableSelector(updatedState);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "when state.allEntities.areExistsInTargetShown = true",
        areExistsInTargetShown: true,
      },
      {
        name: "when state.allEntities.areExistsInTargetShown = false",
        areExistsInTargetShown: false,
      },
    ],
  );

  test("the tagIdsByNameSelectorFactory matches its snapshot", () => {
    const getTagIdsByName = tagsSelectors.tagIdsByNameBySelectorFactory(ToolName.Toggl);
    const result = getTagIdsByName(TEST_STATE);

    expect(result).toMatchSnapshot();
  });

  test("the targetTagIdsSelectorFactory matches its snapshot", () => {
    const getTargetTagIds = tagsSelectors.targetTagIdsSelectorFactory([
      "4001",
      "4002",
      "4003",
      "4004",
      "4005",
    ]);
    const result = getTargetTagIds(TEST_STATE);

    expect(result).toMatchSnapshot();
  });
});
