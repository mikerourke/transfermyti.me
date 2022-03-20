import cases from "jest-in-case";

import * as timeEntriesSelectors from "../timeEntriesSelectors";
import { state } from "~/redux/__mocks__/mockStoreWithState";

const TEST_STATE = {
  ...state,
  timeEntries: {
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
        linkedId: "clock-entry-01",
        isIncluded: false,
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
        linkedId: "clock-entry-02",
        isIncluded: false,
        memberOf: "timeEntries",
      },
      "8003": {
        id: "8003",
        description: "This is a test entry (03)",
        isBillable: false,
        start: "2019-06-23T14:30:00.000Z",
        end: "2019-06-24T04:30:00.000Z",
        year: 2019,
        isActive: false,
        clientId: "3001",
        projectId: "2001",
        tagIds: ["4003"],
        tagNames: ["tag-c"],
        taskId: "7002",
        userId: "6001",
        userGroupIds: [],
        workspaceId: "1001",
        entryCount: 0,
        linkedId: "clock-entry-03",
        isIncluded: false,
        memberOf: "timeEntries",
      },
      "8004": {
        id: "8004",
        description: "This is a test entry (04)",
        isBillable: false,
        start: "2019-06-23T14:00:20.000Z",
        end: "2019-06-23T17:05:20.000Z",
        year: 2019,
        isActive: false,
        clientId: "3002",
        projectId: "2002",
        tagIds: [],
        tagNames: [],
        taskId: null,
        userId: "6001",
        userGroupIds: [],
        workspaceId: "1001",
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: "timeEntries",
      },
      "8005": {
        id: "8005",
        description: "This is a test entry (05)",
        isBillable: false,
        start: "2019-06-22T14:00:19.000Z",
        end: "2019-06-22T19:15:19.000Z",
        year: 2019,
        isActive: false,
        clientId: "3002",
        projectId: "2002",
        tagIds: [],
        tagNames: [],
        taskId: null,
        userId: "6001",
        userGroupIds: [],
        workspaceId: "1001",
        entryCount: 0,
        linkedId: null,
        isIncluded: true,
        memberOf: "timeEntries",
      },
    },
    target: {
      "clock-entry-01": {
        id: "clock-entry-01",
        description: "This is a test entry (01)",
        isBillable: false,
        start: "2019-06-25T18:00:00.000Z",
        end: "2019-06-25T23:00:00.000Z",
        year: 2019,
        isActive: false,
        clientId: "clock-client-01",
        projectId: "clock-project-01",
        tagIds: ["clock-tag-01", "clock-tag-02"],
        tagNames: ["tag-a", "tag-b"],
        taskId: "clock-task-01",
        userId: "clock-user-01",
        userGroupIds: [],
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "8001",
        isIncluded: true,
        memberOf: "timeEntries",
      },
      "clock-entry-02": {
        id: "clock-entry-02",
        description: "This is a test entry (02)",
        isBillable: false,
        start: "2019-06-24T14:00:00.000Z",
        end: "2019-06-24T22:00:00.000Z",
        year: 2019,
        isActive: false,
        clientId: "clock-client-01",
        projectId: "clock-project-01",
        tagIds: [],
        tagNames: [],
        taskId: "clock-task-02",
        userId: "clock-user-01",
        userGroupIds: [],
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "8002",
        isIncluded: true,
        memberOf: "timeEntries",
      },
      "clock-entry-03": {
        id: "clock-entry-03",
        description: "This is a test entry (03)",
        isBillable: false,
        start: "2019-06-23T14:30:00.000Z",
        end: "2019-06-24T04:30:00.000Z",
        year: 2019,
        isActive: false,
        clientId: "clock-client-01",
        projectId: "clock-project-01",
        tagIds: ["clock-tag-01"],
        tagNames: ["tag-a"],
        taskId: "clock-task-03",
        userId: "clock-user-01",
        userGroupIds: [],
        workspaceId: "clock-workspace-01",
        entryCount: 0,
        linkedId: "8003",
        isIncluded: true,
        memberOf: "timeEntries",
      },
    },
    isFetching: false,
    isDuplicateCheckEnabled: true,
  },
};

describe("within timeEntriesSelectors", () => {
  test("the sourceTimeEntriesSelector returns array of values from state.source", () => {
    const result = timeEntriesSelectors.sourceTimeEntriesSelector(TEST_STATE);

    expect(result).toEqual(Object.values(TEST_STATE.timeEntries.source));
  });

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(TEST_STATE);

      expect(result).toMatchSnapshot();
    },
    [
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
        selector:
          timeEntriesSelectors.sourceTimeEntriesInActiveWorkspaceSelector,
      },
      {
        name: "for the timeEntriesTotalCountsByTypeSelector",
        selector: timeEntriesSelectors.timeEntriesTotalCountsByTypeSelector,
      },
      {
        name: "for the sourceTimeEntryCountByTagIdSelector",
        selector: timeEntriesSelectors.sourceTimeEntryCountByTagIdSelector,
      },
    ],
  );

  test(`the sourceTimeEntriesForTransferSelector returns all values if state.isDuplicateCheckEnabled = false`, () => {
    const updatedState = {
      ...TEST_STATE,
      timeEntries: {
        ...TEST_STATE.timeEntries,
        isDuplicateCheckEnabled: false,
      },
    };
    const result =
      timeEntriesSelectors.sourceTimeEntriesForTransferSelector(updatedState);
    const expected =
      timeEntriesSelectors.includedSourceTimeEntriesSelector(TEST_STATE);

    expect(result).toEqual(expected);
  });

  cases(
    "the timeEntriesForInclusionsTableSelector matches its snapshot based on state.allEntities.areExistsInTargetShown",
    (options) => {
      const updatedState = {
        ...TEST_STATE,
        allEntities: {
          ...TEST_STATE.allEntities,
          areExistsInTargetShown: options.areExistsInTargetShown,
        },
      };
      const result =
        timeEntriesSelectors.timeEntriesForInclusionsTableSelector(
          updatedState,
        );

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

  test(`the timeEntriesForInclusionsTableSelector matches its snapshot when state.isDuplicateCheckEnabled = false`, () => {
    const updatedState = {
      ...TEST_STATE,
      timeEntries: {
        ...TEST_STATE.timeEntries,
        isDuplicateCheckEnabled: false,
      },
    };
    const result =
      timeEntriesSelectors.timeEntriesForInclusionsTableSelector(updatedState);

    expect(result).toMatchSnapshot();
  });

  test("the sourceTimeEntryCountByIdFieldSelectorFactory matches its snapshot", () => {
    const getCounts =
      timeEntriesSelectors.sourceTimeEntryCountByIdFieldSelectorFactory("6001");
    const result = getCounts(TEST_STATE);

    expect(result).toMatchSnapshot();
  });
});
