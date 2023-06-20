import { describe, expect, test } from "vitest";

import { FAKES } from "~/testUtilities";

import * as projectsSelectors from "../projects.selectors";

const MOCK_STATE = { ...FAKES.REDUX_STATE };

describe("within projectsSelectors", () => {
  describe("selectors that directly access state return the correct value", () => {
    const testCases = [
      {
        name: "sourceProjectsByIdSelector returns state.sourceProjectsById",
        selector: projectsSelectors.sourceProjectsByIdSelector,
        expected: MOCK_STATE.projects.source,
      },
      {
        name: "sourceProjectsSelector returns values from state.sourceProjectsById",
        selector: projectsSelectors.sourceProjectsSelector,
        expected: Object.values(MOCK_STATE.projects.source),
      },
      {
        name: "targetProjectsByIdSelector returns state.targetProjectsById",
        selector: projectsSelectors.targetProjectsByIdSelector,
        expected: MOCK_STATE.projects.target,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(MOCK_STATE);

        expect(result).toEqual(testCase.expected);
      });
    }
  });

  describe("the selectors match their snapshots", () => {
    const testCases = [
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
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(MOCK_STATE);

        expect(result).toMatchSnapshot();
      });
    }
  });

  describe("the projectsForInclusionsTableSelector matches its snapshot based on state.allEntities.areExistsInTargetShown", () => {
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
        const result = projectsSelectors.projectsForInclusionsTableSelector(updatedState);

        expect(result).toMatchSnapshot();
      });
    }
  });
});
