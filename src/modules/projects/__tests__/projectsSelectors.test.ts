import cases from "jest-in-case";

import { state } from "~/redux/__mocks__/mockStoreWithState";

import * as projectsSelectors from "../projectsSelectors";

const TEST_STATE = {
  ...state,
  projects: {
    source: {
      "2001": {
        id: "2001",
        name: "Test Project A",
        workspaceId: "1001",
        clientId: "3001",
        isBillable: false,
        isPublic: false,
        isActive: true,
        color: "#ea468d",
        estimate: { estimate: 0, type: "MANUAL" },
        userIds: ["6001"],
        entryCount: 3,
        linkedId: "clock-project-01",
        isIncluded: false,
        memberOf: "projects",
      },
      "2002": {
        id: "2002",
        name: "Test Project B",
        workspaceId: "1001",
        clientId: null,
        isBillable: false,
        isPublic: false,
        isActive: false,
        color: "#3750b5",
        estimate: { estimate: 40, type: "MANUAL" },
        userIds: ["6001"],
        entryCount: 3,
        linkedId: "clock-project-02",
        isIncluded: false,
        memberOf: "projects",
      },
      "2003": {
        id: "2003",
        name: "Test Project C",
        workspaceId: "1001",
        clientId: null,
        isBillable: false,
        isPublic: false,
        isActive: true,
        color: "#c56bff",
        estimate: { estimate: 0, type: "MANUAL" },
        userIds: ["6001"],
        entryCount: 3,
        linkedId: "clock-project-03",
        isIncluded: false,
        memberOf: "projects",
      },
      "2004": {
        id: "2004",
        name: "Test Project D",
        workspaceId: "1001",
        clientId: null,
        isBillable: false,
        isPublic: false,
        isActive: true,
        color: "#04bb9b",
        estimate: { estimate: 0, type: "MANUAL" },
        userIds: ["6001"],
        entryCount: 3,
        linkedId: null,
        isIncluded: true,
        memberOf: "projects",
      },
      "2005": {
        id: "2005",
        name: "Test Project E",
        workspaceId: "1001",
        clientId: null,
        isBillable: false,
        isPublic: false,
        isActive: true,
        color: "#205500",
        estimate: { estimate: 0, type: "MANUAL" },
        userIds: ["6001"],
        entryCount: 4,
        linkedId: null,
        isIncluded: true,
        memberOf: "projects",
      },
      "2006": {
        id: "2006",
        name: "Test Project F",
        workspaceId: "1001",
        clientId: null,
        isBillable: false,
        isPublic: false,
        isActive: true,
        color: "#a01aa5",
        estimate: { estimate: 0, type: "MANUAL" },
        userIds: ["6001"],
        entryCount: 4,
        linkedId: null,
        isIncluded: false,
        memberOf: "projects",
      },
    },
    target: {
      "clock-project-01": {
        id: "clock-project-01",
        name: "Test Project A",
        workspaceId: "clock-workspace-01",
        clientId: "clock-client-01",
        isBillable: false,
        isPublic: false,
        isActive: true,
        color: "#ea468d",
        estimate: { estimate: "PT0S", type: "AUTO" },
        userIds: ["clock-user-01"],
        entryCount: 0,
        linkedId: "2001",
        isIncluded: false,
        memberOf: "projects",
      },
      "clock-project-02": {
        id: "clock-project-02",
        name: "Test Project B",
        workspaceId: "clock-workspace-01",
        clientId: "clock-client-02",
        isBillable: false,
        isPublic: false,
        isActive: true,
        color: "#c56bff",
        estimate: { estimate: "PT0S", type: "AUTO" },
        userIds: ["clock-user-01"],
        entryCount: 0,
        linkedId: "2002",
        isIncluded: false,
        memberOf: "projects",
      },
      "clock-project-03": {
        id: "clock-project-03",
        name: "Test Project C",
        workspaceId: "clock-workspace-01",
        clientId: "",
        isBillable: false,
        isPublic: false,
        isActive: false,
        color: "#04bb9b",
        estimate: { estimate: "PT0S", type: "AUTO" },
        userIds: ["clock-user-01"],
        entryCount: 0,
        linkedId: "2003",
        isIncluded: false,
        memberOf: "projects",
      },
    },
    isFetching: false,
  },
};

describe("within projectsSelectors", () => {
  cases(
    "selectors that directly access state return the correct value",
    (options) => {
      const result = options.selector(TEST_STATE);

      expect(result).toEqual(options.expected);
    },
    [
      {
        name: "sourceProjectsByIdSelector returns state.sourceProjectsById",
        selector: projectsSelectors.sourceProjectsByIdSelector,
        expected: TEST_STATE.projects.source,
      },
      {
        name: "sourceProjectsSelector returns values from state.sourceProjectsById",
        selector: projectsSelectors.sourceProjectsSelector,
        expected: Object.values(TEST_STATE.projects.source),
      },
      {
        name: "targetProjectsByIdSelector returns state.targetProjectsById",
        selector: projectsSelectors.targetProjectsByIdSelector,
        expected: TEST_STATE.projects.target,
      },
    ],
  );

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(TEST_STATE);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "for the includedSourceProjectsSelector",
        selector: projectsSelectors.includedSourceProjectsSelector,
      },
      {
        name: "for the includedSourceProjectIdsSelector",
        selector: projectsSelectors.includedSourceProjectIdsSelector,
      },
      {
        name: "for the sourceProjectsForTransferSelector",
        selector: projectsSelectors.sourceProjectsForTransferSelector,
      },
      {
        name: "for the sourceProjectsInActiveWorkspaceSelector",
        selector: projectsSelectors.sourceProjectsInActiveWorkspaceSelector,
      },
      {
        name: "for the projectIdToLinkedIdSelector",
        selector: projectsSelectors.projectIdToLinkedIdSelector,
      },
      {
        name: "for the projectsTotalCountsByTypeSelector",
        selector: projectsSelectors.projectsTotalCountsByTypeSelector,
      },
      {
        name: "for the projectsByWorkspaceIdByToolNameSelector",
        selector: projectsSelectors.projectsByWorkspaceIdByToolNameSelector,
      },
    ],
  );

  cases(
    "the projectsForInclusionsTableSelector matches its snapshot based on state.allEntities.areExistsInTargetShown",
    (options) => {
      const updatedState = {
        ...TEST_STATE,
        allEntities: {
          ...TEST_STATE.allEntities,
          areExistsInTargetShown: options.areExistsInTargetShown,
        },
      };
      const result =
        projectsSelectors.projectsForInclusionsTableSelector(updatedState);

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
