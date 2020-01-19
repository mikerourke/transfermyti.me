import cases from "jest-in-case";
import { ReduxTestAction } from "~/redux/__mocks__/mockStoreWithState";
import * as appActions from "../appActions";
import { appReducer, initialState } from "../appReducer";

describe("within appReducer", () => {
  const invalidAction: ReduxTestAction = { type: "INVALID_ACTION" };

  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = appReducer(initialState, invalidAction);
    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = appReducer(undefined as any, invalidAction);
    expect(result).toEqual(initialState);
  });

  test("showNotification action creates a new notification = payload when dispatched", () => {
    const result = appReducer(
      initialState,
      appActions.showNotification({ message: "Test Message", type: "info" }),
    );
    const [firstNotification] = result.notifications;

    expect(firstNotification.message).toBe("Test Message");
    expect(firstNotification.type).toBe("info");
    expect(firstNotification.id).toBeDefined();
  });

  cases(
    "sets the correct error message when showFetchErrorNotification is dispatched",
    options => {
      const result = appReducer(
        initialState,
        appActions.showErrorNotification(options.payload),
      );
      const [firstNotification] = result.notifications;

      expect(firstNotification.message).toBe(options.expected);
      expect(firstNotification.type).toBe("error");
      expect(firstNotification.id).toBeDefined();
    },
    [
      {
        name: "when the error payload is an Error",
        payload: new Error("Test error message"),
        expected: "The following error occurred: Test error message",
      },
      {
        name: "when the error is thrown from redux-saga",
        payload: new Error("call: argument fn is undefined or null"),
        expected: "The following error occurred: Parsing error",
      },
    ],
  );
});
