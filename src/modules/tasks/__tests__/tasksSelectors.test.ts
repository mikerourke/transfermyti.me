import cases from "jest-in-case";

import { state } from "~/redux/__mocks__/mockStoreWithState";

import * as tasksSelectors from "../tasksSelectors";

const TEST_STATE = {
  ...state,
  tasks: {
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
        linkedId: "clock-task-01",
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
        linkedId: "clock-task-02",
        isIncluded: false,
        memberOf: "tasks",
      },
      "7003": {
        id: "7003",
        name: "Task 3",
        estimate: "PT6H",
        projectId: "2002",
        assigneeIds: [],
        isActive: true,
        workspaceId: "1001",
        entryCount: 1,
        linkedId: null,
        isIncluded: true,
        memberOf: "tasks",
      },
      "7004": {
        id: "7004",
        name: "Task 4",
        estimate: "PT6H",
        projectId: "2003",
        assigneeIds: [],
        isActive: false,
        workspaceId: "1001",
        entryCount: 1,
        linkedId: null,
        isIncluded: true,
        memberOf: "tasks",
      },
      "7005": {
        id: "7005",
        name: "Task 5",
        estimate: "PT6H",
        projectId: "2004",
        assigneeIds: [],
        isActive: true,
        workspaceId: "1001",
        entryCount: 3,
        linkedId: null,
        isIncluded: true,
        memberOf: "tasks",
      },
    },
    target: {
      "clock-task-01": {
        id: "clock-task-01",
        name: "Task 1",
        estimate: "PT1H30M15S",
        projectId: "clock-project-01",
        assigneeIds: ["clock-user-01"],
        isActive: true,
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "7001",
        isIncluded: false,
        memberOf: "tasks",
      },
      "clock-task-02": {
        id: "clock-task-02",
        name: "Task 2",
        estimate: "PT1H",
        projectId: "clock-project-01",
        assigneeIds: ["clock-user-01"],
        isActive: false,
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "7002",
        isIncluded: false,
        memberOf: "tasks",
      },
    },
    isFetching: false,
  },
};

describe("within tasksSelectors", () => {
  test("the sourceTasksByIdSelector returns state.source", () => {
    const result = tasksSelectors.sourceTasksByIdSelector(TEST_STATE);

    expect(result).toEqual(TEST_STATE.tasks.source);
  });

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(TEST_STATE);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "for the includedSourceTasksSelector",
        selector: tasksSelectors.includedSourceTasksSelector,
      },
      {
        name: "for the sourceTasksForTransferSelector",
        selector: tasksSelectors.sourceTasksForTransferSelector,
      },
      {
        name: "for the sourceTasksInActiveWorkspaceSelector",
        selector: tasksSelectors.sourceTasksInActiveWorkspaceSelector,
      },
      {
        name: "for the taskIdToLinkedIdSelector",
        selector: tasksSelectors.taskIdToLinkedIdSelector,
      },
      {
        name: "for the tasksTotalCountsByTypeSelector",
        selector: tasksSelectors.tasksTotalCountsByTypeSelector,
      },
    ],
  );

  test("the includedSourceTasksCountSelector returns the count of included source tasks", () => {
    const result = tasksSelectors.includedSourceTasksCountSelector(TEST_STATE);

    expect(result).toBe(3);
  });

  cases(
    "the tasksForInclusionsTableSelector matches its snapshot based on state.allEntities.areExistsInTargetShown",
    (options) => {
      const updatedState = {
        ...TEST_STATE,
        allEntities: {
          ...TEST_STATE.allEntities,
          areExistsInTargetShown: options.areExistsInTargetShown,
        },
      };
      const result = tasksSelectors.tasksForInclusionsTableSelector(updatedState);

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
});
