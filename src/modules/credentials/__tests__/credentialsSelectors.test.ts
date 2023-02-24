import cases from "jest-in-case";

import { FAKES } from "~/testUtilities";

import * as credentialsSelectors from "../credentialsSelectors";

const { REDUX_STATE } = FAKES;

describe("within credentialsSelectors", () => {
  cases(
    "selectors that directly access state return the correct value",
    (options) => {
      const result = options.selector(REDUX_STATE);

      expect(result).toEqual(options.expected);
    },
    [
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
    ],
  );

  test("the hasValidationErrorsSelector returns true if validation errors present in state", () => {
    const result = credentialsSelectors.hasValidationErrorsSelector({ ...REDUX_STATE });

    expect(result).toBe(true);
  });

  cases(
    "the selectors match their snapshots",
    (options) => {
      const result = options.selector({ ...REDUX_STATE });

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
