import { lensProp, set } from "ramda";
import { describe, expect, test } from "vitest";

import * as timeEntriesActions from "~/redux/timeEntries/timeEntries.actions";
import { FAKES } from "~/testUtilities";

import { timeEntriesInitialState, timeEntriesReducer } from "../timeEntries.reducer";

const { INVALID_ACTION, REDUX_STATE, TOGGL_TIME_ENTRY_ID } = FAKES;

const MOCK_PAYLOAD = {
  source: { ...REDUX_STATE.timeEntries.source },
  target: { ...REDUX_STATE.timeEntries.target },
};

describe("within timeEntriesReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = timeEntriesReducer(timeEntriesInitialState, INVALID_ACTION);

    expect(result).toEqual(timeEntriesInitialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = timeEntriesReducer(undefined, INVALID_ACTION);

    expect(result).toEqual(timeEntriesInitialState);
  });

  describe("the isFetching is set to the correct value based on the dispatched action", () => {
    const testCases = [
      {
        name: "when the createTimeEntries.success action is dispatched",
        initialStatus: true,
        action: timeEntriesActions.createTimeEntries.success(MOCK_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchTimeEntries.success action is dispatched",
        initialStatus: true,
        action: timeEntriesActions.fetchTimeEntries.success(MOCK_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the createTimeEntries.request action is dispatched",
        initialStatus: false,
        action: timeEntriesActions.createTimeEntries.request(),
        expectedStatus: true,
      },
      {
        name: "when the deleteTimeEntries.request action is dispatched",
        initialStatus: false,
        action: timeEntriesActions.deleteTimeEntries.request(),
        expectedStatus: true,
      },
      {
        name: "when the fetchTimeEntries.request action is dispatched",
        initialStatus: false,
        action: timeEntriesActions.fetchTimeEntries.request(),
        expectedStatus: true,
      },
      {
        name: "when the createTimeEntries.failure action is dispatched",
        initialStatus: true,
        action: timeEntriesActions.createTimeEntries.failure(),
        expectedStatus: false,
      },
      {
        name: "when the deleteTimeEntries.failure action is dispatched",
        initialStatus: true,
        action: timeEntriesActions.deleteTimeEntries.failure(),
        expectedStatus: false,
      },
      {
        name: "when the fetchTimeEntries.failure action is dispatched",
        initialStatus: true,
        action: timeEntriesActions.fetchTimeEntries.failure(),
        expectedStatus: false,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const updatedState = {
          ...REDUX_STATE.timeEntries,
          isFetching: testCase.initialStatus,
        };
        const result = timeEntriesReducer(updatedState, testCase.action);

        expect(result.isFetching).toEqual(testCase.expectedStatus);
      });
    }
  });

  test("the isDuplicateCheckEnabledToggled action flips the isDuplicateCheckEnabled value in state", () => {
    const result = timeEntriesReducer(
      { ...REDUX_STATE.timeEntries, isDuplicateCheckEnabled: false },
      timeEntriesActions.isDuplicateCheckEnabledToggled(),
    );

    expect(result.isDuplicateCheckEnabled).toBe(true);
  });

  test(`the isTimeEntryIncludedToggled action flips the "isIncluded" value of the timeEntry with id = payload`, () => {
    const updatedState = set(
      lensProp("source"),
      {
        [TOGGL_TIME_ENTRY_ID]: {
          ...REDUX_STATE.timeEntries.source[TOGGL_TIME_ENTRY_ID],
          isIncluded: false,
        },
      },
      REDUX_STATE.timeEntries,
    );

    const result = timeEntriesReducer(
      updatedState,
      timeEntriesActions.isTimeEntryIncludedToggled(TOGGL_TIME_ENTRY_ID),
    );

    expect(result.source[TOGGL_TIME_ENTRY_ID].isIncluded).toBe(true);
  });

  test(`the areAllTimeEntriesIncludedUpdated action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...REDUX_STATE.timeEntries,
      source: {
        "8001": {
          ...REDUX_STATE.timeEntries.source["8001"],
          linkedId: null,
          isIncluded: true,
        },
        "8002": {
          ...REDUX_STATE.timeEntries.source["8002"],
          entryCount: 0,
          linkedId: null,
          isIncluded: true,
        },
      },
      target: {},
    };

    const result = timeEntriesReducer(
      updatedState,
      timeEntriesActions.areAllTimeEntriesIncludedUpdated(true),
    );

    expect(result.source["8001"].isIncluded).toEqual(true);
    expect(result.source["8002"].isIncluded).toEqual(true);
  });

  test("the deleteTimeEntries.success action resets state to initial state", () => {
    const result = timeEntriesReducer(
      REDUX_STATE.timeEntries,
      timeEntriesActions.deleteTimeEntries.success(),
    );

    expect(result).toEqual(timeEntriesInitialState);
  });
});
