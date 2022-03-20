import cases from "jest-in-case";
import * as R from "ramda";

import * as timeEntriesActions from "../timeEntriesActions";
import { timeEntriesReducer, initialState } from "../timeEntriesReducer";
import { state, invalidAction } from "~/redux/__mocks__/mockStoreWithState";

const TEST_TIME_ENTRIES_STATE = { ...state.timeEntries };

const TEST_TIME_ENTRY_ID = "8001";

const TEST_PAYLOAD = {
  source: { ...TEST_TIME_ENTRIES_STATE.source },
  target: { ...TEST_TIME_ENTRIES_STATE.target },
};

describe("within timeEntriesReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = timeEntriesReducer(initialState, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = timeEntriesReducer(undefined as any, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  cases(
    "the isFetching is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...TEST_TIME_ENTRIES_STATE,
        isFetching: options.initialStatus,
      };
      const result = timeEntriesReducer(updatedState, options.action);

      expect(result.isFetching).toEqual(options.expectedStatus);
    },
    [
      {
        name: "when the createTimeEntries.success action is dispatched",
        initialStatus: true,
        action: timeEntriesActions.createTimeEntries.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchTimeEntries.success action is dispatched",
        initialStatus: true,
        action: timeEntriesActions.fetchTimeEntries.success(TEST_PAYLOAD),
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
    ],
  );

  test("the flipIsDuplicateCheckEnabled action flips the isDuplicateCheckEnabled value in state", () => {
    const result = timeEntriesReducer(
      state,
      timeEntriesActions.flipIsDuplicateCheckEnabled(),
    );

    expect(result.isDuplicateCheckEnabled).toBe(true);
  });

  test(`the flipIsTimeEntryIncluded action flips the "isIncluded" value of the timeEntry with id = payload`, () => {
    const updatedState = R.set(
      R.lensProp("source"),
      {
        [TEST_TIME_ENTRY_ID]: {
          ...TEST_TIME_ENTRIES_STATE.source[TEST_TIME_ENTRY_ID],
          isIncluded: false,
        },
      },
      TEST_TIME_ENTRIES_STATE,
    );
    const result = timeEntriesReducer(
      updatedState,
      timeEntriesActions.flipIsTimeEntryIncluded(TEST_TIME_ENTRY_ID),
    );

    expect(result.source[TEST_TIME_ENTRY_ID].isIncluded).toBe(true);
  });

  test(`the updateAreAllTimeEntriesIncluded action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...TEST_TIME_ENTRIES_STATE,
      source: {
        "8001": {
          id: "8001",
          description: "This is a test entry (01)",
          isBillable: false,
          start: "2019-06-25T18:00:00.000Z",
          end: "2019-06-25T23:00:00.000Z",
          year: 2019,
          isActive: false,
          clientId: "3001",
          projectId: "2001",
          tagIds: ["4001", "4002"],
          tagNames: ["tag-a", "tag-b"],
          taskId: "7001",
          userId: "6001",
          userGroupIds: [],
          workspaceId: "1001",
          entryCount: 0,
          linkedId: null,
          isIncluded: true,
          memberOf: "timeEntries",
        },
        "8002": {
          id: "8002",
          description: "This is a test entry (02)",
          isBillable: false,
          start: "2019-06-24T14:00:00.000Z",
          end: "2019-06-24T22:00:00.000Z",
          year: 2019,
          isActive: false,
          clientId: "3001",
          projectId: "2001",
          tagIds: [],
          tagNames: [],
          taskId: "7001",
          userId: "6001",
          userGroupIds: [],
          workspaceId: "1001",
          entryCount: 0,
          linkedId: null,
          isIncluded: true,
          memberOf: "timeEntries",
        },
      },
      target: {},
    };
    const result = timeEntriesReducer(
      updatedState,
      timeEntriesActions.updateAreAllTimeEntriesIncluded(true),
    );

    expect(result.source["8001"].isIncluded).toEqual(true);
    expect(result.source["8002"].isIncluded).toEqual(true);
  });

  test("the deleteTimeEntries.success action resets state to initial state", () => {
    const result = timeEntriesReducer(
      state,
      timeEntriesActions.deleteTimeEntries.success(),
    );

    expect(result).toEqual(initialState);
  });
});
