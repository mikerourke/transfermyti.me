import { lensProp, set } from "ramda";

import * as projectsActions from "~/redux/projects/projectsActions";
import { FAKES } from "~/testUtilities";

import { projectsInitialState, projectsReducer } from "../projectsReducer";

const { INVALID_ACTION, REDUX_STATE, TOGGL_PROJECT_ID } = FAKES;

const MOCK_PAYLOAD = {
  source: { ...REDUX_STATE.projects.source },
  target: { ...REDUX_STATE.projects.target },
};

describe("within projectsReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = projectsReducer(projectsInitialState, INVALID_ACTION);

    expect(result).toEqual(projectsInitialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = projectsReducer(undefined, INVALID_ACTION);

    expect(result).toEqual(projectsInitialState);
  });

  describe("the isFetching is set to the correct value based on the dispatched action", () => {
    const testCases = [
      {
        name: "when the createProjects.success action is dispatched",
        initialStatus: true,
        action: projectsActions.createProjects.success(MOCK_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchProjects.success action is dispatched",
        initialStatus: true,
        action: projectsActions.fetchProjects.success(MOCK_PAYLOAD),
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
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const updatedState = {
          ...REDUX_STATE.projects,
          isFetching: testCase.initialStatus,
        };
        const result = projectsReducer(updatedState, testCase.action);

        expect(result.isFetching).toEqual(testCase.expectedStatus);
      });
    }
  });

  test(`the isProjectIncludedToggled action flips the "isIncluded" value of the project with id = payload`, () => {
    const updatedState = set(
      lensProp("source"),
      {
        [TOGGL_PROJECT_ID]: {
          ...REDUX_STATE.projects.source[TOGGL_PROJECT_ID],
          isIncluded: false,
        },
      },
      REDUX_STATE.projects,
    );

    const result = projectsReducer(
      updatedState,
      projectsActions.isProjectIncludedToggled(TOGGL_PROJECT_ID),
    );

    expect(result.source[TOGGL_PROJECT_ID].isIncluded).toBe(true);
  });

  test(`the isProjectIncludedUpdated action sets the "isIncluded" value based on payload`, () => {
    const updatedState = set(
      lensProp("source"),
      {
        [TOGGL_PROJECT_ID]: {
          ...REDUX_STATE.projects.source[TOGGL_PROJECT_ID],
          isIncluded: true,
        },
      },
      REDUX_STATE.projects,
    );

    const result = projectsReducer(
      updatedState,
      projectsActions.isProjectIncludedUpdated({
        id: TOGGL_PROJECT_ID,
        isIncluded: false,
      }),
    );

    expect(result.source[TOGGL_PROJECT_ID].isIncluded).toBe(false);
  });

  test(`the areAllProjectsIncludedUpdated action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...REDUX_STATE.projects,
      source: {
        "2001": {
          ...REDUX_STATE.projects.source["2001"],
          linkedId: null,
          isIncluded: false,
        },
        "2002": {
          ...REDUX_STATE.projects.source["2002"],
          linkedId: null,
          isIncluded: false,
        },
      },
      target: {},
    };

    const result = projectsReducer(
      updatedState,
      projectsActions.areAllProjectsIncludedUpdated(true),
    );

    expect(result.source["2001"].isIncluded).toEqual(true);
    expect(result.source["2002"].isIncluded).toEqual(true);
  });

  test("the deleteProjects.success action resets state to initial state", () => {
    const result = projectsReducer(REDUX_STATE.projects, projectsActions.deleteProjects.success());

    expect(result).toEqual(projectsInitialState);
  });
});
