import { describe, expect, test } from "vitest";

import { FAKES } from "~/testUtilities";

import * as credentialsSelectors from "../credentials.selectors";

const { REDUX_STATE } = FAKES;

describe("within credentialsSelectors", () => {
  describe("selectors that directly access state return the correct value", () => {
    const testCases = [
      {
        name: "validationFetchStatusSelector returns state.validationFetchStatus",
        selector: credentialsSelectors.validationFetchStatusSelector,
        expected: REDUX_STATE.credentials.validationFetchStatus,
      },
      {
        name: "validationErrorsByMappingSelector returns state.validationErrorsByMapping",
        selector: credentialsSelectors.validationErrorsByMappingSelector,
        expected: REDUX_STATE.credentials.validationErrorsByMapping,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector(REDUX_STATE);

        expect(result).toEqual(testCase.expected);
      });
    }
  });

  test("the hasValidationErrorsSelector returns true if validation errors present in state", () => {
    const result = credentialsSelectors.hasValidationErrorsSelector({ ...REDUX_STATE });

    expect(result).toBe(true);
  });

  describe("the selectors match their snapshots", () => {
    const testCases = [
      {
        name: "for the credentialsByMappingSelector",
        selector: credentialsSelectors.credentialsByMappingSelector,
      },
      {
        name: "for the credentialsByToolNameSelector",
        selector: credentialsSelectors.credentialsByToolNameSelector,
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = testCase.selector({ ...REDUX_STATE });

        expect(result).toMatchSnapshot();
      });
    }
  });
});
