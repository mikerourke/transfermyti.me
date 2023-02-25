import { describe, expect, test } from "vitest";

import * as credentialsActions from "~/modules/credentials/credentialsActions";
import { FAKES } from "~/testUtilities";
import { FetchStatus, Mapping } from "~/typeDefs";

import { credentialsReducer, credentialsInitialState } from "../credentialsReducer";

const { REDUX_STATE, INVALID_ACTION } = FAKES;

const MOCK_CREDENTIALS = {
  source: { ...FAKES.CLOCKIFY_CREDENTIALS },
  target: { ...FAKES.TOGGL_CREDENTIALS },
};

describe("within credentialsReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = credentialsReducer(credentialsInitialState, INVALID_ACTION);

    expect(result).toEqual(credentialsInitialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = credentialsReducer(undefined, INVALID_ACTION);

    expect(result).toEqual(credentialsInitialState);
  });

  test("the validateCredentials.request action updates state.validationFetchStatus and state.validationErrorsByMapping when dispatched", () => {
    const result = credentialsReducer(
      { ...REDUX_STATE.credentials },
      credentialsActions.validateCredentials.request(),
    );

    expect(result.validationFetchStatus).toBe(FetchStatus.InProcess);
    expect(result.validationErrorsByMapping).toEqual({
      ...credentialsInitialState.validationErrorsByMapping,
    });
  });

  test("the validateCredentials.failure action updates state.validationFetchStatus and state.validationErrorsByMapping when dispatched", () => {
    const result = credentialsReducer(
      { ...REDUX_STATE.credentials },
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
      { ...REDUX_STATE.credentials },
      credentialsActions.validateCredentials.success({ ...MOCK_CREDENTIALS }),
    );

    expect(result).toEqual({
      ...REDUX_STATE.credentials,
      ...MOCK_CREDENTIALS,
      validationFetchStatus: FetchStatus.Success,
      validationErrorsByMapping: { ...credentialsInitialState.validationErrorsByMapping },
    });
  });

  test("the credentialsFlushed action resets state to initial state when dispatched", () => {
    const result = credentialsReducer(
      { ...REDUX_STATE.credentials },
      credentialsActions.credentialsFlushed(),
    );

    expect(result).toEqual({ ...credentialsInitialState });
  });

  test("the credentialsUpdated action updates the mapping from payload with credentials from payload", () => {
    const newCredentials = {
      apiKey: "NEW",
      email: "NEW",
      userId: "New",
    };

    const result = credentialsReducer(
      { ...REDUX_STATE.credentials },
      credentialsActions.credentialsUpdated({
        mapping: Mapping.Source,
        ...newCredentials,
      }),
    );

    expect(result).toEqual({
      ...REDUX_STATE.credentials,
      source: { ...newCredentials },
    });
  });

  describe("the validationFetchStatusUpdated action", () => {
    test("updates state.validationFetchStatus only if payload is not Pending", () => {
      const result = credentialsReducer(
        { ...REDUX_STATE.credentials },
        credentialsActions.validationFetchStatusUpdated(FetchStatus.InProcess),
      );

      expect(result).toEqual({
        ...REDUX_STATE.credentials,
        validationFetchStatus: FetchStatus.InProcess,
      });
    });

    test("updates state.validationFetchStatus and resets state.validationErrorsByMapping if payload = Pending", () => {
      const result = credentialsReducer(
        { ...REDUX_STATE.credentials },
        credentialsActions.validationFetchStatusUpdated(FetchStatus.Pending),
      );

      expect(result).toEqual({
        ...REDUX_STATE.credentials,
        validationFetchStatus: FetchStatus.Pending,
        validationErrorsByMapping: {
          ...credentialsInitialState.validationErrorsByMapping,
        },
      });
    });
  });
});
