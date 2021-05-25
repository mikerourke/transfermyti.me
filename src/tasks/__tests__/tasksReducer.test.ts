import cases from "jest-in-case";
import * as R from "ramda";

import * as tasksActions from "../tasksActions";
import { tasksReducer, initialState } from "../tasksReducer";
import { state, invalidAction } from "~/redux/__mocks__/mockStoreWithState";

const TEST_TASKS_STATE = { ...state.tasks };

const TEST_TASK_ID = "7001";

const TEST_PAYLOAD = {
  source: { ...TEST_TASKS_STATE.source },
  target: { ...TEST_TASKS_STATE.target },
};

describe("within tasksReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = tasksReducer(initialState, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = tasksReducer(undefined as any, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  cases(
    "the isFetching is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...TEST_TASKS_STATE,
        isFetching: options.initialStatus,
      };
      const result = tasksReducer(updatedState, options.action);

      expect(result.isFetching).toEqual(options.expectedStatus);
    },
    [
      {
        name: "when the createTasks.success action is dispatched",
        initialStatus: true,
        action: tasksActions.createTasks.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchTasks.success action is dispatched",
        initialStatus: true,
        action: tasksActions.fetchTasks.success(TEST_PAYLOAD),
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
    ],
  );

  test(`the flipIsTaskIncluded action flips the "isIncluded" value of the task with id = payload`, () => {
    const updatedState = R.set(
      R.lensProp("source"),
      {
        [TEST_TASK_ID]: {
          ...TEST_TASKS_STATE.source[TEST_TASK_ID],
          isIncluded: false,
        },
      },
      TEST_TASKS_STATE,
    );
    const result = tasksReducer(
      updatedState,
      tasksActions.flipIsTaskIncluded(TEST_TASK_ID),
    );

    expect(result.source[TEST_TASK_ID].isIncluded).toBe(true);
  });

  test(`the updateIsTaskIncluded action sets the "isIncluded" value based on payload`, () => {
    const updatedState = R.set(
      R.lensProp("source"),
      {
        [TEST_TASK_ID]: {
          ...TEST_TASKS_STATE.source[TEST_TASK_ID],
          isIncluded: true,
        },
      },
      TEST_TASKS_STATE,
    );
    const result = tasksReducer(
      updatedState,
      tasksActions.updateIsTaskIncluded({
        id: TEST_TASK_ID,
        isIncluded: false,
      }),
    );

    expect(result.source[TEST_TASK_ID].isIncluded).toBe(false);
  });

  test(`the updateAreAllTasksIncluded action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...TEST_TASKS_STATE,
      source: {
        "7001": {
          id: "7001",
          name: "Task 1",
          estimate: "PT2H",
          projectId: "2001",
          assigneeIds: ["123123"],
          isActive: true,
          workspaceId: "1001",
          entryCount: 2,
          linkedId: null,
          isIncluded: false,
          memberOf: "tasks",
        },
        "7002": {
          id: "7002",
          name: "Task 2",
          estimate: "PT0M",
          projectId: "2001",
          assigneeIds: [],
          isActive: true,
          workspaceId: "1001",
          entryCount: 1,
          linkedId: null,
          isIncluded: false,
          memberOf: "tasks",
        },
      },
      target: {},
    };
    const result = tasksReducer(
      updatedState,
      tasksActions.updateAreAllTasksIncluded(true),
    );

    expect(result.source["7001"].isIncluded).toEqual(true);
    expect(result.source["7001"].isIncluded).toEqual(true);
  });

  test("the deleteTasks.success action resets state to initial state", () => {
    const result = tasksReducer(state, tasksActions.deleteTasks.success());

    expect(result).toEqual(initialState);
  });
});
