import { lensProp, set } from "ramda";
import { describe, expect, test } from "vitest";

import * as tagsActions from "~/redux/tags/tags.actions";
import { FAKES } from "~/testUtilities";

import { tagsInitialState, tagsReducer } from "../tags.reducer";

const { INVALID_ACTION, REDUX_STATE, TOGGL_TAG_ID } = FAKES;

const MOCK_PAYLOAD = {
  source: { ...REDUX_STATE.tags.source },
  target: { ...REDUX_STATE.tags.target },
};

describe("within tagsReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = tagsReducer(tagsInitialState, INVALID_ACTION);

    expect(result).toEqual(tagsInitialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = tagsReducer(undefined, INVALID_ACTION);

    expect(result).toEqual(tagsInitialState);
  });

  describe("the isFetching is set to the correct value based on the dispatched action", () => {
    const testCases = [
      {
        name: "when the createTags.success action is dispatched",
        initialStatus: true,
        action: tagsActions.createTags.success(MOCK_PAYLOAD),
        expectedStatus: false,
      },
      {
        name: "when the fetchTags.success action is dispatched",
        initialStatus: true,
        action: tagsActions.fetchTags.success(MOCK_PAYLOAD),
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
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const updatedState = {
          ...REDUX_STATE.tags,
          isFetching: testCase.initialStatus,
        };

        const result = tagsReducer(updatedState, testCase.action);

        expect(result.isFetching).toEqual(testCase.expectedStatus);
      });
    }
  });

  test(`the isTagIncludedToggled action flips the "isIncluded" value of the tag with id = payload`, () => {
    const updatedState = set(
      lensProp("source"),
      {
        [TOGGL_TAG_ID]: {
          ...REDUX_STATE.tags.source[TOGGL_TAG_ID],
          isIncluded: false,
        },
      },
      REDUX_STATE.tags,
    );
    const result = tagsReducer(updatedState, tagsActions.isTagIncludedToggled(TOGGL_TAG_ID));

    expect(result.source[TOGGL_TAG_ID].isIncluded).toBe(true);
  });

  test(`the areAllTagsIncludedUpdated action sets the "isIncluded" value of all records to payload`, () => {
    const updatedState = {
      ...REDUX_STATE.tags,
      source: {
        "4001": {
          ...REDUX_STATE.tags.source["4001"],
          entryCount: 1,
          linkedId: null,
          isIncluded: false,
        },
        "4002": {
          ...REDUX_STATE.tags.source["4002"],
          entryCount: 1,
          linkedId: null,
          isIncluded: false,
        },
      },
      target: {},
    };

    const result = tagsReducer(updatedState, tagsActions.areAllTagsIncludedUpdated(true));

    expect(result.source["4001"].isIncluded).toEqual(true);
    expect(result.source["4002"].isIncluded).toEqual(true);
  });

  test("the deleteTags.success action resets state to initial state", () => {
    const result = tagsReducer(REDUX_STATE.tags, tagsActions.deleteTags.success());

    expect(result).toEqual(tagsInitialState);
  });
});
