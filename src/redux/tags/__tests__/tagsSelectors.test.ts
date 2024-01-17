import { FAKES } from "~/testUtilities";
import { ToolName } from "~/types";

import * as tagsSelectors from "../tagsSelectors";

const MOCK_STATE = {
  ...FAKES.REDUX_STATE,
  tags: {
    ...FAKES.REDUX_STATE.tags,
    source: {
      ...FAKES.REDUX_STATE.tags.source,
      "4004": {
        ...FAKES.REDUX_STATE.tags.source["4004"],
        linkedId: null,
        isIncluded: false,
      },
      "4005": {
        ...FAKES.REDUX_STATE.tags.source["4005"],
        linkedId: null,
        isIncluded: false,
      },
      "4006": {
        ...FAKES.REDUX_STATE.tags.source["4006"],
        linkedId: null,
        isIncluded: true,
      },
      "4007": {
        ...FAKES.REDUX_STATE.tags.source["4007"],
        linkedId: null,
        isIncluded: true,
      },
      "4008": {
        ...FAKES.REDUX_STATE.tags.source["4008"],
        linkedId: null,
        isIncluded: true,
      },
      "4009": {
        ...FAKES.REDUX_STATE.tags.source["4009"],
        linkedId: null,
        isIncluded: true,
      },
    },
    target: {
      ...FAKES.REDUX_STATE.tags.target,
    },
  },
};

describe("within tagsSelectors", () => {
  describe("the selectors match their snapshots", () => {
    const testCases = [
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
    ];

    for (const testCase of testCases) {
      test(testCase.name, () => {
        const result = testCase.selector(MOCK_STATE);

        expect(result).toMatchSnapshot();
      });
    }
  });

  describe("the tagsForInclusionsTableSelector matches its snapshot based on state.allEntities.areExistsInTargetShown", () => {
    const testCases = [
      {
        name: "when state.allEntities.areExistsInTargetShown = true",
        areExistsInTargetShown: true,
      },
      {
        name: "when state.allEntities.areExistsInTargetShown = false",
        areExistsInTargetShown: false,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const updatedState = {
          ...MOCK_STATE,
          allEntities: {
            ...MOCK_STATE.allEntities,
            areExistsInTargetShown: testCase.areExistsInTargetShown,
          },
        };

        const result = tagsSelectors.tagsForInclusionsTableSelector(updatedState);

        expect(result).toMatchSnapshot();
      });
    }
  });

  test("the tagIdsByNameSelectorFactory matches its snapshot", () => {
    const getTagIdsByName = tagsSelectors.tagIdsByNameBySelectorFactory(ToolName.Toggl);

    const result = getTagIdsByName(MOCK_STATE);

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

    const result = getTargetTagIds(MOCK_STATE);

    expect(result).toMatchSnapshot();
  });
});
