import cases from "jest-in-case";
import * as R from "ramda";

import { state } from "~/redux/__mocks__/mockStoreWithState";
import { EntityGroup, ToolName } from "~/typeDefs";

import * as allEntitiesSelectors from "../allEntitiesSelectors";

describe("within allEntitiesSelectors", () => {
  cases(
    "selectors that directly access state return the correct value",
    (options) => {
      const result = options.selector(state);

      expect(result).toEqual(options.expected);
    },
    [
      {
        name: "areExistsInTargetShownSelector returns state.areExistsInTargetShown",
        selector: allEntitiesSelectors.areExistsInTargetShownSelector,
        expected: state.allEntities.areExistsInTargetShown,
      },
      {
        name: "fetchAllFetchStatusSelector returns state.fetchAllFetchStatus",
        selector: allEntitiesSelectors.fetchAllFetchStatusSelector,
        expected: state.allEntities.fetchAllFetchStatus,
      },
      {
        name: "pushAllChangesFetchStatusSelector returns state.pushAllChangesFetchStatus",
        selector: allEntitiesSelectors.pushAllChangesFetchStatusSelector,
        expected: state.allEntities.pushAllChangesFetchStatus,
      },
      {
        name: "toolActionSelector returns state.toolAction",
        selector: allEntitiesSelectors.toolActionSelector,
        expected: state.allEntities.toolAction,
      },
      {
        name: "toolNameByMappingSelector returns state.toolNameByMapping",
        selector: allEntitiesSelectors.toolNameByMappingSelector,
        expected: state.allEntities.toolNameByMapping,
      },
      {
        name: "transferCountsByEntityGroupSelector returns state.transferCountsByEntityGroup",
        selector: allEntitiesSelectors.transferCountsByEntityGroupSelector,
        expected: state.allEntities.transferCountsByEntityGroup,
      },
      {
        name: "toolForTargetMappingSelector returns state.toolNameByMapping.target",
        selector: allEntitiesSelectors.toolForTargetMappingSelector,
        expected: state.allEntities.toolNameByMapping.target,
      },
    ],
  );

  test("the entityGroupInProcessDisplaySelector returns state.entityGroupInProcess display value", () => {
    const updatedState = R.set(
      R.lensPath(["allEntities", "entityGroupInProcess"]),
      EntityGroup.TimeEntries,
      state,
    );
    const result = allEntitiesSelectors.entityGroupInProcessDisplaySelector(updatedState);

    expect(result).toBe("time entries");
  });

  test("the includedCountsByEntityGroupSelector returns the count of entities by group", () => {
    const result = allEntitiesSelectors.includedCountsByEntityGroupSelector(state);

    expect(result).toEqual({
      clients: 0,
      tags: 4,
      projects: 0,
      tasks: 0,
      timeEntries: 0,
      userGroups: 0,
      users: 0,
    });
  });

  test("the totalIncludedRecordsCountSelector returns sum of included record counts", () => {
    const result = allEntitiesSelectors.totalIncludedRecordsCountSelector(state);

    expect(result).toBe(4);
  });

  test("the mappingByToolNameSelector returns state.toolNameByMapping inverted", () => {
    const result = allEntitiesSelectors.mappingByToolNameSelector(state);
    const { toolNameByMapping } = state.allEntities;

    expect(result).toEqual({
      [toolNameByMapping.source]: "source",
      [toolNameByMapping.target]: "target",
    });
  });

  test("the toolHelpDetailsByMappingSelector returns details pertaining to the toolNameByMapping", () => {
    const updatedState = R.set(
      R.lensPath(["allEntities", "toolNameByMapping"]),
      { source: ToolName.Clockify, target: ToolName.Toggl },
      state,
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
    const updatedState = R.set(
      R.lensPath(["allEntities", "toolNameByMapping"]),
      { source: ToolName.Clockify, target: ToolName.Toggl },
      state,
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
      const updatedState = R.set(
        R.lensPath(["allEntities", "toolNameByMapping"]),
        { source: ToolName.Clockify, target: ToolName.None },
        state,
      );
      const result = allEntitiesSelectors.targetToolDisplayNameSelector(updatedState);

      expect(result).toBe("Clockify");
    });

    test("returns the target display name if target tool is not None", () => {
      const updatedState = R.set(
        R.lensPath(["allEntities", "toolNameByMapping"]),
        { source: ToolName.Clockify, target: ToolName.Toggl },
        state,
      );
      const result = allEntitiesSelectors.targetToolDisplayNameSelector(updatedState);

      expect(result).toBe("Toggl");
    });
  });

  describe("the targetToolTrackerUrlSelector", () => {
    test("returns the source URL if target tool = None", () => {
      const updatedState = R.set(
        R.lensPath(["allEntities", "toolNameByMapping"]),
        { source: ToolName.Clockify, target: ToolName.None },
        state,
      );
      const result = allEntitiesSelectors.targetToolTrackerUrlSelector(updatedState);

      expect(result).toBe("https://clockify.me/tracker");
    });

    test("returns the target URL if target tool is not None", () => {
      const updatedState = R.set(
        R.lensPath(["allEntities", "toolNameByMapping"]),
        { source: ToolName.Clockify, target: ToolName.Toggl },
        state,
      );
      const result = allEntitiesSelectors.targetToolTrackerUrlSelector(updatedState);

      expect(result).toBe("https://toggl.com/app/timer");
    });
  });
});
