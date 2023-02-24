import { lensPath, set } from "ramda";
import { describe, test } from "vitest";

import { FAKES } from "~/testUtilities";
import { EntityGroup, ToolName } from "~/typeDefs";

const { REDUX_STATE } = FAKES;

import * as allEntitiesSelectors from "../allEntitiesSelectors";

describe("within allEntitiesSelectors", () => {
  describe("selectors that directly access state return the correct value", () => {
    const testCases = [
      {
        name: "areExistsInTargetShownSelector returns state.areExistsInTargetShown",
        selector: allEntitiesSelectors.areExistsInTargetShownSelector,
        expected: REDUX_STATE.allEntities.areExistsInTargetShown,
      },
      {
        name: "fetchAllFetchStatusSelector returns state.fetchAllFetchStatus",
        selector: allEntitiesSelectors.fetchAllFetchStatusSelector,
        expected: REDUX_STATE.allEntities.fetchAllFetchStatus,
      },
      {
        name: "pushAllChangesFetchStatusSelector returns state.pushAllChangesFetchStatus",
        selector: allEntitiesSelectors.pushAllChangesFetchStatusSelector,
        expected: REDUX_STATE.allEntities.pushAllChangesFetchStatus,
      },
      {
        name: "toolActionSelector returns state.toolAction",
        selector: allEntitiesSelectors.toolActionSelector,
        expected: REDUX_STATE.allEntities.toolAction,
      },
      {
        name: "toolNameByMappingSelector returns state.toolNameByMapping",
        selector: allEntitiesSelectors.toolNameByMappingSelector,
        expected: REDUX_STATE.allEntities.toolNameByMapping,
      },
      {
        name: "transferCountsByEntityGroupSelector returns state.transferCountsByEntityGroup",
        selector: allEntitiesSelectors.transferCountsByEntityGroupSelector,
        expected: REDUX_STATE.allEntities.transferCountsByEntityGroup,
      },
      {
        name: "toolForTargetMappingSelector returns state.toolNameByMapping.target",
        selector: allEntitiesSelectors.toolForTargetMappingSelector,
        expected: REDUX_STATE.allEntities.toolNameByMapping.target,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(REDUX_STATE);

        expect(result).toEqual(testCase.expected);
      });
    }
  });

  test("the entityGroupInProcessDisplaySelector returns state.entityGroupInProcess display value", () => {
    const updatedState = set(
      lensPath(["allEntities", "entityGroupInProcess"]),
      EntityGroup.TimeEntries,
      REDUX_STATE,
    );
    const result = allEntitiesSelectors.entityGroupInProcessDisplaySelector(updatedState);

    expect(result).toBe("time entries");
  });

  test("the includedCountsByEntityGroupSelector returns the count of entities by group", () => {
    const result = allEntitiesSelectors.includedCountsByEntityGroupSelector(REDUX_STATE);

    expect(result).toEqual({
      clients: 0,
      tags: 4,
      projects: 2,
      tasks: 0,
      timeEntries: 0,
      userGroups: 0,
      users: 0,
    });
  });

  test("the totalIncludedRecordsCountSelector returns sum of included record counts", () => {
    const result = allEntitiesSelectors.totalIncludedRecordsCountSelector(REDUX_STATE);

    expect(result).toBe(6);
  });

  test("the mappingByToolNameSelector returns state.toolNameByMapping inverted", () => {
    const result = allEntitiesSelectors.mappingByToolNameSelector(REDUX_STATE);
    const { toolNameByMapping } = REDUX_STATE.allEntities;

    expect(result).toEqual({
      [toolNameByMapping.source]: "source",
      [toolNameByMapping.target]: "target",
    });
  });

  test("the toolHelpDetailsByMappingSelector returns details pertaining to the toolNameByMapping", () => {
    const updatedState = set(
      lensPath(["allEntities", "toolNameByMapping"]),
      { source: ToolName.Clockify, target: ToolName.Toggl },
      REDUX_STATE,
    );
    const result = allEntitiesSelectors.toolHelpDetailsByMappingSelector(updatedState);

    expect(result).toEqual({
      source: {
        toolName: ToolName.Clockify,
        displayName: "Clockify",
        toolLink: "https://clockify.me/user/settings",
      },
      target: {
        toolName: ToolName.Toggl,
        displayName: "Toggl",
        toolLink: "https://toggl.com/app/profile",
      },
    });
  });

  describe("the replaceMappingWithToolNameSelector", () => {
    const updatedState = set(
      lensPath(["allEntities", "toolNameByMapping"]),
      { source: ToolName.Clockify, target: ToolName.Toggl },
      REDUX_STATE,
    );
    const replacer = allEntitiesSelectors.replaceMappingWithToolNameSelector(updatedState);

    test(`replaces instances of "source" and "target" with the tool display name`, () => {
      const result = replacer("Records in Source and Target");

      expect(result).toBe("Records in Clockify and Toggl");
    });

    test(`does no replacement if "source" and "target" are not present`, () => {
      const result = replacer("Records in No Mapping");

      expect(result).toBe("Records in No Mapping");
    });
  });

  describe("the targetToolDisplayNameSelector", () => {
    test("returns the source display name if target tool = None", () => {
      const updatedState = set(
        lensPath(["allEntities", "toolNameByMapping"]),
        { source: ToolName.Clockify, target: ToolName.None },
        REDUX_STATE,
      );
      const result = allEntitiesSelectors.targetToolDisplayNameSelector(updatedState);

      expect(result).toBe("Clockify");
    });

    test("returns the target display name if target tool is not None", () => {
      const updatedState = set(
        lensPath(["allEntities", "toolNameByMapping"]),
        { source: ToolName.Clockify, target: ToolName.Toggl },
        REDUX_STATE,
      );
      const result = allEntitiesSelectors.targetToolDisplayNameSelector(updatedState);

      expect(result).toBe("Toggl");
    });
  });

  describe("the targetToolTrackerUrlSelector", () => {
    test("returns the source URL if target tool = None", () => {
      const updatedState = set(
        lensPath(["allEntities", "toolNameByMapping"]),
        { source: ToolName.Clockify, target: ToolName.None },
        REDUX_STATE,
      );
      const result = allEntitiesSelectors.targetToolTrackerUrlSelector(updatedState);

      expect(result).toBe("https://clockify.me/tracker");
    });

    test("returns the target URL if target tool is not None", () => {
      const updatedState = set(
        lensPath(["allEntities", "toolNameByMapping"]),
        { source: ToolName.Clockify, target: ToolName.Toggl },
        REDUX_STATE,
      );
      const result = allEntitiesSelectors.targetToolTrackerUrlSelector(updatedState);

      expect(result).toBe("https://toggl.com/app/timer");
    });
  });
});
