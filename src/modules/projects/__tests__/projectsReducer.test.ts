import cases from "jest-in-case";
import * as R from "ramda";

import * as projectsActions from "~/modules/projects/projectsActions";
import { state, invalidAction } from "~/redux/__mocks__/mockStoreWithState";

import { projectsReducer, initialState } from "../projectsReducer";

const TEST_PROJECTS_STATE = { ...state.projects };

const TEST_PROJECT_ID = "2001";

const TEST_PAYLOAD = {
  source: { ...TEST_PROJECTS_STATE.source },
  target: { ...TEST_PROJECTS_STATE.target },
};

describe("within projectsReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = projectsReducer(initialState, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = projectsReducer(undefined as any, invalidAction as any);

    expect(result).toEqual(initialState);
  });

  cases(
    "the isFetching is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...TEST_PROJECTS_STATE,
        isFetching: options.initialStatus,
      };
      const result = projectsReducer(updatedState, options.action);

      expect(result.isFetching).toEqual(options.expectedStatus);
    },
    [
      {
        name: "when the createProjects.success action is dispatched",
        initialStatus: true,
        action: projectsActions.createProjects.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchProjects.success action is dispatched",
        initialStatus: true,
        action: projectsActions.fetchProjects.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the createProjects.request action is dispatched",
        initialStatus: false,
        action: projectsActions.createProjects.request(),
        expectedStatus: true,
      },
      {
        name: "when the deleteProjects.request action is dispatched",
        initialStatus: false,
        action: projectsActions.deleteProjects.request(),
        expectedStatus: true,
      },
      {
        name: "when the fetchProjects.request action is dispatched",
        initialStatus: false,
        action: projectsActions.fetchProjects.request(),
        expectedStatus: true,
      },
      {
        name: "when the createProjects.failure action is dispatched",
        initialStatus: true,
        action: projectsActions.createProjects.failure(),
        expectedStatus: false,
      },
      {
        name: "when the deleteProjects.failure action is dispatched",
        initialStatus: true,
        action: projectsActions.deleteProjects.failure(),
        expectedStatus: false,
      },
      {
        name: "when the fetchProjects.failure action is dispatched",
        initialStatus: true,
        action: projectsActions.fetchProjects.failure(),
        expectedStatus: false,
      },
    ],
  );

  test(`the flipIsProjectIncluded action flips the "isIncluded" value of the project with id = payload`, () => {
    const updatedState = R.set(
      R.lensProp("source"),
      {
        [TEST_PROJECT_ID]: {
          ...TEST_PROJECTS_STATE.source[TEST_PROJECT_ID],
          isIncluded: false,
        },
      },
      TEST_PROJECTS_STATE,
    );
    const result = projectsReducer(
      updatedState,
      projectsActions.flipIsProjectIncluded(TEST_PROJECT_ID),
    );

    expect(result.source[TEST_PROJECT_ID].isIncluded).toBe(true);
  });

  test(`the updateIsProjectIncluded action sets the "isIncluded" value based on payload`, () => {
    const updatedState = R.set(
      R.lensProp("source"),
      {
        [TEST_PROJECT_ID]: {
          ...TEST_PROJECTS_STATE.source[TEST_PROJECT_ID],
          isIncluded: true,
        },
      },
      TEST_PROJECTS_STATE,
    );
    const result = projectsReducer(
      updatedState,
      projectsActions.updateIsProjectIncluded({
        id: TEST_PROJECT_ID,
        isIncluded: false,
      }),
    );

    expect(result.source[TEST_PROJECT_ID].isIncluded).toBe(false);
  });

  test(`the updateAreAllProjectsIncluded action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...TEST_PROJECTS_STATE,
      source: {
        "2001": {
          id: "2001",
          name: "Test Project A",
          workspaceId: "1001",
          clientId: null,
          isBillable: false,
          isPublic: false,
          isActive: true,
          color: "#ea468d",
          estimate: { estimate: 0, type: "MANUAL" },
          userIds: ["6001"],
          entryCount: 3,
          linkedId: null,
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
          linkedId: null,
          isIncluded: false,
          memberOf: "projects",
        },
      },
      target: {},
    };
    const result = projectsReducer(
      updatedState,
      projectsActions.updateAreAllProjectsIncluded(true),
    );

    expect(result.source["2001"].isIncluded).toEqual(true);
    expect(result.source["2002"].isIncluded).toEqual(true);
  });

  test("the deleteProjects.success action resets state to initial state", () => {
    const result = projectsReducer(state, projectsActions.deleteProjects.success());

    expect(result).toEqual(initialState);
  });
});
