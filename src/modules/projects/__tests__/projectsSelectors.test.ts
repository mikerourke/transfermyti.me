import cases from "jest-in-case";

import { FAKES } from "~/jestUtilities";

import * as projectsSelectors from "../projectsSelectors";

const MOCK_STATE = { ...FAKES.REDUX_STATE };

describe("within projectsSelectors", () => {
  cases(
    "selectors that directly access state return the correct value",
    (options) => {
      const result = options.selector(MOCK_STATE);

      expect(result).toEqual(options.expected);
    },
    [
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
    ],
  );

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(MOCK_STATE);

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
        ...MOCK_STATE,
        allEntities: {
          ...MOCK_STATE.allEntities,
          areExistsInTargetShown: options.areExistsInTargetShown,
        },
      };
      const result = projectsSelectors.projectsForInclusionsTableSelector(updatedState);

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
