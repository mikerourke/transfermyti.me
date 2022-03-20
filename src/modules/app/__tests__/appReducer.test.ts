import cases from "jest-in-case";

import * as appActions from "../appActions";
import { appReducer, initialState } from "../appReducer";
import { invalidAction } from "~/redux/__mocks__/mockStoreWithState";

describe("within appReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = appReducer(initialState, invalidAction);

    expect(result).toEqual(initialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = appReducer(undefined as any, invalidAction);

    expect(result).toEqual(initialState);
  });

  test("dismissNotification action removes the notification with id = payload from state when dispatched", () => {
    const testState = {
      ...initialState,
      notifications: [
        { id: "ntf1", type: "info", message: "Test Error" } as const,
      ],
    };
    const result = appReducer(
      testState,
      appActions.dismissNotification("ntf1"),
    );

    expect(result.notifications).toHaveLength(0);
  });

  test("dismissAllNotifications action removes all notifications from state when dispatched", () => {
    const testState = {
      ...initialState,
      notifications: [
        { id: "ntf1", type: "info", message: "Test Error 1" } as const,
        { id: "ntf2", type: "info", message: "Test Error 2" } as const,
      ],
    };
    const result = appReducer(testState, appActions.dismissAllNotifications());

    expect(result.notifications).toHaveLength(0);
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
    (options) => {
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
      {
        name: "when the error is a Clockify API response",
        payload: {
          ok: false,
          status: 404,
          statusText: "Error",
          url: "/api/clockify/me",
        } as Response,
        expected:
          "The following error occurred: Error code 404 when fetching from Clockify API. Status: Error",
      },
      {
        name: "when the error is a Toggl API response",
        payload: {
          ok: false,
          status: 400,
          statusText: "Error",
          url: "/api/toggle/me",
        } as Response,
        expected:
          "The following error occurred: Error code 400 when fetching from Toggl API. Status: Error",
      },
      {
        name: "when the error is an unknown API response with no status",
        payload: {
          ok: false,
          status: 400,
          statusText: "",
          url: "/api/unknown/me",
        } as Response,
        expected:
          "The following error occurred: Error code 400 when fetching from unknown API.",
      },
    ],
  );
});
