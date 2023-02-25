import { lensProp, set } from "ramda";
import { describe, expect, test } from "vitest";

import * as tasksActions from "~/modules/tasks/tasksActions";
import { FAKES } from "~/testUtilities";

import { initialState, tasksReducer } from "../tasksReducer";

const { INVALID_ACTION, REDUX_STATE, TOGGL_TASK_ID } = FAKES;

const MOCK_PAYLOAD = {
  source: { ...REDUX_STATE.tasks.source },
  target: { ...REDUX_STATE.tasks.target },
};

describe("within tasksReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = tasksReducer(initialState, INVALID_ACTION);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = tasksReducer(undefined, INVALID_ACTION);

    expect(result).toEqual(initialState);
  });

  describe("the isFetching is set to the correct value based on the dispatched action", () => {
    const testCases = [
      {
        name: "when the createTasks.success action is dispatched",
        initialStatus: true,
        action: tasksActions.createTasks.success(MOCK_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchTasks.success action is dispatched",
        initialStatus: true,
        action: tasksActions.fetchTasks.success(MOCK_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the createTasks.request action is dispatched",
        initialStatus: false,
        action: tasksActions.createTasks.request(),
        expectedStatus: true,
      },
      {
        name: "when the deleteTasks.request action is dispatched",
        initialStatus: false,
        action: tasksActions.deleteTasks.request(),
        expectedStatus: true,
      },
      {
        name: "when the fetchTasks.request action is dispatched",
        initialStatus: false,
        action: tasksActions.fetchTasks.request(),
        expectedStatus: true,
      },
      {
        name: "when the createTasks.failure action is dispatched",
        initialStatus: true,
        action: tasksActions.createTasks.failure(),
        expectedStatus: false,
      },
      {
        name: "when the deleteTasks.failure action is dispatched",
        initialStatus: true,
        action: tasksActions.deleteTasks.failure(),
        expectedStatus: false,
      },
      {
        name: "when the fetchTasks.failure action is dispatched",
        initialStatus: true,
        action: tasksActions.fetchTasks.failure(),
        expectedStatus: false,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const updatedState = {
          ...REDUX_STATE.tasks,
          isFetching: testCase.initialStatus,
        };
        const result = tasksReducer(updatedState, testCase.action);

        expect(result.isFetching).toEqual(testCase.expectedStatus);
      });
    }
  });

  test(`the isTaskIncludedToggled action flips the "isIncluded" value of the task with id = payload`, () => {
    const updatedState = set(
      lensProp("source"),
      {
        [TOGGL_TASK_ID]: {
          ...REDUX_STATE.tasks.source[TOGGL_TASK_ID],
          isIncluded: false,
        },
      },
      REDUX_STATE.tasks,
    );

    const result = tasksReducer(updatedState, tasksActions.isTaskIncludedToggled(TOGGL_TASK_ID));

    expect(result.source[TOGGL_TASK_ID].isIncluded).toBe(true);
  });

  test(`the isTaskIncludedUpdated action sets the "isIncluded" value based on payload`, () => {
    const updatedState = set(
      lensProp("source"),
      {
        [TOGGL_TASK_ID]: {
          ...REDUX_STATE.tasks.source[TOGGL_TASK_ID],
          isIncluded: true,
        },
      },
      REDUX_STATE.tasks,
    );

    const result = tasksReducer(
      updatedState,
      tasksActions.isTaskIncludedUpdated({
        id: TOGGL_TASK_ID,
        isIncluded: false,
      }),
    );

    expect(result.source[TOGGL_TASK_ID].isIncluded).toBe(false);
  });

  test(`the areAllTasksIncludedUpdated action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...REDUX_STATE.tasks,
      source: {
        "7001": {
          ...REDUX_STATE.tasks.source["7001"],
          entryCount: 2,
          linkedId: null,
          isIncluded: false,
        },
        "7002": {
          ...REDUX_STATE.tasks.source["7002"],
          entryCount: 1,
          linkedId: null,
          isIncluded: false,
        },
      },
      target: {},
    };
    const result = tasksReducer(updatedState, tasksActions.areAllTasksIncludedUpdated(true));

    expect(result.source["7001"].isIncluded).toEqual(true);
    expect(result.source["7001"].isIncluded).toEqual(true);
  });

  test("the deleteTasks.success action resets state to initial state", () => {
    const result = tasksReducer(REDUX_STATE.tasks, tasksActions.deleteTasks.success());

    expect(result).toEqual(initialState);
  });
});
