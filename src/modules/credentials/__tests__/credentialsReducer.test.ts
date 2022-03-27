import * as credentialsActions from "~/modules/credentials/credentialsActions";
import { invalidAction, state } from "~/redux/__mocks__/mockStoreWithState";
import { FetchStatus, Mapping } from "~/typeDefs";

import { credentialsReducer, initialState } from "../credentialsReducer";

const TEST_CREDENTIALS = {
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
};

const TEST_CREDENTIALS_STATE = { ...state.credentials, ...TEST_CREDENTIALS };

describe("within credentialsReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = credentialsReducer(initialState, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = credentialsReducer(undefined as AnyValid, invalidAction as AnyValid);

    expect(result).toEqual(initialState);
  });

  test("the validateCredentials.request action updates state.validationFetchStatus and state.validationErrorsByMapping when dispatched", () => {
    const result = credentialsReducer(
      TEST_CREDENTIALS_STATE,
      credentialsActions.validateCredentials.request(),
    );

    expect(result.validationFetchStatus).toBe(FetchStatus.InProcess);
    expect(result.validationErrorsByMapping).toEqual({
      ...initialState.validationErrorsByMapping,
    });
  });

  test("the validateCredentials.failure action updates state.validationFetchStatus and state.validationErrorsByMapping when dispatched", () => {
    const result = credentialsReducer(
      TEST_CREDENTIALS_STATE,
      credentialsActions.validateCredentials.failure({
        source: "Error",
        target: "Error",
      }),
    );

    expect(result.validationFetchStatus).toBe(FetchStatus.Error);
    expect(result.validationErrorsByMapping).toEqual({
      source: "Error",
      target: "Error",
    });
  });

  test("the validateCredentials.success action updates credentials in state when dispatched", () => {
    const result = credentialsReducer(
      TEST_CREDENTIALS_STATE,
      credentialsActions.validateCredentials.success({ ...TEST_CREDENTIALS }),
    );

    expect(result).toEqual({
      ...TEST_CREDENTIALS_STATE,
      ...TEST_CREDENTIALS,
      validationFetchStatus: FetchStatus.Success,
      validationErrorsByMapping: { ...initialState.validationErrorsByMapping },
    });
  });

  test("the credentialsFlushed action resets state to initial state when dispatched", () => {
    const result = credentialsReducer(
      TEST_CREDENTIALS_STATE,
      credentialsActions.credentialsFlushed(),
    );

    expect(result).toEqual({ ...initialState });
  });

  test("the credentialsUpdated action updates the mapping from payload with credentials from payload", () => {
    const newCredentials = {
      apiKey: "NEW",
      email: "NEW",
      userId: "New",
    };

    const result = credentialsReducer(
      TEST_CREDENTIALS_STATE,
      credentialsActions.credentialsUpdated({
        mapping: Mapping.Source,
        ...newCredentials,
      }),
    );

    expect(result).toEqual({
      ...TEST_CREDENTIALS_STATE,
      source: { ...newCredentials },
    });
  });

  describe("the validationFetchStatusUpdated action", () => {
    test("updates state.validationFetchStatus only if payload is not Pending", () => {
      const result = credentialsReducer(
        TEST_CREDENTIALS_STATE,
        credentialsActions.validationFetchStatusUpdated(FetchStatus.InProcess),
      );

      expect(result).toEqual({
        ...TEST_CREDENTIALS_STATE,
        validationFetchStatus: FetchStatus.InProcess,
      });
    });

    test("updates state.validationFetchStatus and resets state.validationErrorsByMapping if payload = Pending", () => {
      const result = credentialsReducer(
        TEST_CREDENTIALS_STATE,
        credentialsActions.validationFetchStatusUpdated(FetchStatus.Pending),
      );

      expect(result).toEqual({
        ...TEST_CREDENTIALS_STATE,
        validationFetchStatus: FetchStatus.Pending,
        validationErrorsByMapping: {
          ...initialState.validationErrorsByMapping,
        },
      });
    });
  });
});
