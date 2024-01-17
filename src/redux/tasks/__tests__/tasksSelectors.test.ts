import { FAKES } from "~/testUtilities";

import * as tasksSelectors from "../tasksSelectors";

const MOCK_STATE = {
  ...FAKES.REDUX_STATE,
  tasks: {
    ...FAKES.REDUX_STATE.tasks,
    source: {
      ...FAKES.REDUX_STATE.tasks.source,
      "7001": {
        ...FAKES.REDUX_STATE.tasks.source["7001"],
        entryCount: 2,
        linkedId: "clock-task-01",
        isIncluded: false,
      },
      "7002": {
        ...FAKES.REDUX_STATE.tasks.source["7002"],
        entryCount: 1,
        linkedId: "clock-task-02",
        isIncluded: false,
      },
      "7003": {
        ...FAKES.REDUX_STATE.tasks.source["7003"],
        entryCount: 1,
        linkedId: null,
        isIncluded: true,
      },
      "7004": {
        ...FAKES.REDUX_STATE.tasks.source["7004"],
        entryCount: 1,
        linkedId: null,
        isIncluded: true,
        isActive: false,
      },
      "7005": {
        ...FAKES.REDUX_STATE.tasks.source["7005"],
        entryCount: 3,
        linkedId: null,
        isIncluded: true,
      },
    },
  },
};

describe("within tasksSelectors", () => {
  test("the sourceTasksByIdSelector returns state.source", () => {
    const result = tasksSelectors.sourceTasksByIdSelector(MOCK_STATE);

    expect(result).toEqual(MOCK_STATE.tasks.source);
  });

  describe("the selectors match their snapshots", () => {
    const testCases = [
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
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(MOCK_STATE);

        expect(result).toMatchSnapshot();
      });
    }
  });

  test("the includedSourceTasksCountSelector returns the count of included source tasks", () => {
    const result = tasksSelectors.includedSourceTasksCountSelector(MOCK_STATE);

    expect(result).toBe(3);
  });

  describe("the tasksForInclusionsTableSelector matches its snapshot based on state.allEntities.areExistsInTargetShown", () => {
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

        const result = tasksSelectors.tasksForInclusionsTableSelector(updatedState);

        expect(result).toMatchSnapshot();
      });
    }
  });
});
