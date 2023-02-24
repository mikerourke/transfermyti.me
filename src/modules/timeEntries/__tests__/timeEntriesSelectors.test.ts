import { describe, expect, test } from "vitest";

import { FAKES } from "~/testUtilities";

import * as timeEntriesSelectors from "../timeEntriesSelectors";

const MOCK_STATE = {
  ...FAKES.REDUX_STATE,
  timeEntries: {
    ...FAKES.REDUX_STATE.timeEntries,
    source: {
      "8001": {
        ...FAKES.REDUX_STATE.timeEntries.source["8001"],
        entryCount: 0,
        linkedId: "clock-entry-01",
        isIncluded: false,
      },
      "8002": {
        ...FAKES.REDUX_STATE.timeEntries.source["8002"],
        entryCount: 0,
        linkedId: "clock-entry-02",
        isIncluded: false,
      },
      "8003": {
        ...FAKES.REDUX_STATE.timeEntries.source["8003"],
        entryCount: 0,
        linkedId: "clock-entry-03",
        isIncluded: false,
      },
      "8004": {
        ...FAKES.REDUX_STATE.timeEntries.source["8004"],
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
      },
      "8005": {
        ...FAKES.REDUX_STATE.timeEntries.source["8005"],
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
      },
    },
    target: {
      "clock-entry-01": {
        ...FAKES.REDUX_STATE.timeEntries.target["clock-entry-01"],
        entryCount: 0,
        linkedId: "8001",
        isIncluded: true,
      },
      "clock-entry-02": {
        ...FAKES.REDUX_STATE.timeEntries.target["clock-entry-02"],
        entryCount: 0,
        linkedId: "8002",
        isIncluded: true,
      },
      "clock-entry-03": {
        ...FAKES.REDUX_STATE.timeEntries.target["clock-entry-03"],
        entryCount: 0,
        linkedId: "8003",
        isIncluded: true,
      },
    },
  },
};

describe("within timeEntriesSelectors", () => {
  test("the sourceTimeEntriesSelector returns array of values from state.source", () => {
    const result = timeEntriesSelectors.sourceTimeEntriesSelector(MOCK_STATE);

    expect(result).toEqual(Object.values(MOCK_STATE.timeEntries.source));
  });

  describe("the selectors match their snapshots", () => {
    const testCases = [
      {
        name: "for the includedSourceTimeEntriesSelector",
        selector: timeEntriesSelectors.includedSourceTimeEntriesSelector,
      },
      {
        name: "for the sourceTimeEntriesForTransferSelector",
        selector: timeEntriesSelectors.sourceTimeEntriesForTransferSelector,
      },
      {
        name: "for the sourceTimeEntriesInActiveWorkspaceSelector",
        selector: timeEntriesSelectors.sourceTimeEntriesInActiveWorkspaceSelector,
      },
      {
        name: "for the timeEntriesTotalCountsByTypeSelector",
        selector: timeEntriesSelectors.timeEntriesTotalCountsByTypeSelector,
      },
      {
        name: "for the sourceTimeEntryCountByTagIdSelector",
        selector: timeEntriesSelectors.sourceTimeEntryCountByTagIdSelector,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(MOCK_STATE);

        expect(result).toMatchSnapshot();
      });
    }
  });

  test(`the sourceTimeEntriesForTransferSelector returns all values if state.isDuplicateCheckEnabled = false`, () => {
    const updatedState = {
      ...MOCK_STATE,
      timeEntries: {
        ...MOCK_STATE.timeEntries,
        isDuplicateCheckEnabled: false,
      },
    };

    const result = timeEntriesSelectors.sourceTimeEntriesForTransferSelector(updatedState);

    const expected = timeEntriesSelectors.includedSourceTimeEntriesSelector(MOCK_STATE);

    expect(result).toEqual(expected);
  });

  describe("the timeEntriesForInclusionsTableSelector matches its snapshot based on state.allEntities.areExistsInTargetShown", () => {
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

        const result = timeEntriesSelectors.timeEntriesForInclusionsTableSelector(updatedState);

        expect(result).toMatchSnapshot();
      });
    }
  });

  test(`the timeEntriesForInclusionsTableSelector matches its snapshot when state.isDuplicateCheckEnabled = false`, () => {
    const updatedState = {
      ...MOCK_STATE,
      timeEntries: {
        ...MOCK_STATE.timeEntries,
        isDuplicateCheckEnabled: false,
      },
    };

    const result = timeEntriesSelectors.timeEntriesForInclusionsTableSelector(updatedState);

    expect(result).toMatchSnapshot();
  });

  test("the sourceTimeEntryCountByIdFieldSelectorFactory matches its snapshot", () => {
    const getCounts = timeEntriesSelectors.sourceTimeEntryCountByIdFieldSelectorFactory("6001");

    const result = getCounts(MOCK_STATE);

    expect(result).toMatchSnapshot();
  });
});
