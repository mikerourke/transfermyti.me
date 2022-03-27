import cases from "jest-in-case";
import { lensProp, set } from "ramda";

import * as tagsActions from "~/modules/tags/tagsActions";
import { invalidAction, state } from "~/redux/__mocks__/mockStoreWithState";

import { initialState, tagsReducer } from "../tagsReducer";

const TEST_TAGS_STATE = { ...state.tags };

const TEST_TAG_ID = "4001";

const TEST_PAYLOAD = {
  source: { ...TEST_TAGS_STATE.source },
  target: { ...TEST_TAGS_STATE.target },
};

describe("within tagsReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = tagsReducer(initialState, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = tagsReducer(undefined as AnyValid, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  cases(
    "the isFetching is set to the correct value based on the dispatched action",
    (options) => {
      const updatedState = {
        ...TEST_TAGS_STATE,
        isFetching: options.initialStatus,
      };
      const result = tagsReducer(updatedState, options.action);

      expect(result.isFetching).toEqual(options.expectedStatus);
    },
    [
      {
        name: "when the createTags.success action is dispatched",
        initialStatus: true,
        action: tagsActions.createTags.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchTags.success action is dispatched",
        initialStatus: true,
        action: tagsActions.fetchTags.success(TEST_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the createTags.request action is dispatched",
        initialStatus: false,
        action: tagsActions.createTags.request(),
        expectedStatus: true,
      },
      {
        name: "when the deleteTags.request action is dispatched",
        initialStatus: false,
        action: tagsActions.deleteTags.request(),
        expectedStatus: true,
      },
      {
        name: "when the fetchTags.request action is dispatched",
        initialStatus: false,
        action: tagsActions.fetchTags.request(),
        expectedStatus: true,
      },
      {
        name: "when the createTags.failure action is dispatched",
        initialStatus: true,
        action: tagsActions.createTags.failure(),
        expectedStatus: false,
      },
      {
        name: "when the deleteTags.failure action is dispatched",
        initialStatus: true,
        action: tagsActions.deleteTags.failure(),
        expectedStatus: false,
      },
      {
        name: "when the fetchTags.failure action is dispatched",
        initialStatus: true,
        action: tagsActions.fetchTags.failure(),
        expectedStatus: false,
      },
    ],
  );

  test(`the isTagIncludedToggled action flips the "isIncluded" value of the tag with id = payload`, () => {
    const updatedState = set(
      lensProp("source"),
      {
        [TEST_TAG_ID]: {
          ...TEST_TAGS_STATE.source[TEST_TAG_ID],
          isIncluded: false,
        },
      },
      TEST_TAGS_STATE,
    );
    const result = tagsReducer(updatedState, tagsActions.isTagIncludedToggled(TEST_TAG_ID));

    expect(result.source[TEST_TAG_ID].isIncluded).toBe(true);
  });

  test(`the areAllTagsIncludedUpdated action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...TEST_TAGS_STATE,
      source: {
        "4001": {
          id: "4001",
          name: "tag-a",
          workspaceId: "1001",
          entryCount: 1,
          linkedId: null,
          isIncluded: false,
          memberOf: "tags",
        },
        "4002": {
          id: "4002",
          name: "tag-b",
          workspaceId: "1001",
          entryCount: 1,
          linkedId: null,
          isIncluded: false,
          memberOf: "tags",
        },
      },
      target: {},
    };
    const result = tagsReducer(updatedState, tagsActions.areAllTagsIncludedUpdated(true));

    expect(result.source["4001"].isIncluded).toEqual(true);
    expect(result.source["4002"].isIncluded).toEqual(true);
  });

  test("the deleteTags.success action resets state to initial state", () => {
    const result = tagsReducer(state, tagsActions.deleteTags.success());

    expect(result).toEqual(initialState);
  });
});
