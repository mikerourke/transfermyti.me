import cases from "jest-in-case";

import { state } from "~/redux/__mocks__/mockStoreWithState";

import * as credentialsSelectors from "../credentialsSelectors";

const TEST_STATE = {
  ...state,
  credentials: {
    ...state.credentials,
    source: {
      apiKey: "CLOCKIFYAPI",
      email: "clockify@test.com",
      userId: "abc",
    },
    target: {
      apiKey: "TOGGLAPI",
      email: "toggl@test.com",
      userId: "123",
    },
  },
};

describe("within credentialsSelectors", () => {
  cases(
    "selectors that directly access state return the correct value",
    (options) => {
      const result = options.selector(state);

      expect(result).toEqual(options.expected);
    },
    [
      {
        name: "validationFetchStatusSelector returns state.validationFetchStatus",
        selector: credentialsSelectors.validationFetchStatusSelector,
        expected: TEST_STATE.credentials.validationFetchStatus,
      },
      {
        name: "validationErrorsByMappingSelector returns state.validationErrorsByMapping",
        selector: credentialsSelectors.validationErrorsByMappingSelector,
        expected: TEST_STATE.credentials.validationErrorsByMapping,
      },
    ],
  );

  test("the hasValidationErrorsSelector returns true if validation errors present in state", () => {
    const result = credentialsSelectors.hasValidationErrorsSelector(TEST_STATE);

    expect(result).toBe(true);
  });

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector(TEST_STATE);

      expect(result).toMatchSnapshot();
    },
    [
      {
        name: "for the credentialsByMappingSelector",
        selector: credentialsSelectors.credentialsByMappingSelector,
      },
      {
        name: "for the credentialsByToolNameSelector",
        selector: credentialsSelectors.credentialsByToolNameSelector,
      },
    ],
  );
});
