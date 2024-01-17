import { randomUUID } from "node:crypto";

import * as appActions from "~/redux/app/appActions";
import { FAKES } from "~/testUtilities";

import { appReducer, appInitialState } from "../appReducer";

vi.mock("nanoid", () => ({
  nanoid: () => randomUUID(),
}));

const { INVALID_ACTION } = FAKES;

describe("within appReducer", () => {
  test("returns input state if an invalid action type is passed to the reducer", () => {
    const result = appReducer(appInitialState, INVALID_ACTION);

    expect(result).toEqual(appInitialState);
  });

  test("returns input state if no state is passed to the reducer", () => {
    const result = appReducer(undefined, INVALID_ACTION);

    expect(result).toEqual(appInitialState);
  });

  test("the notificationDismissed action removes the notification with id = payload from state when dispatched", () => {
    const testState = {
      ...appInitialState,
      notifications: [{ id: "ntf1", type: "info", message: "Test Error" } as const],
    };

    const result = appReducer(testState, appActions.notificationDismissed("ntf1"));

    expect(result.notifications).toHaveLength(0);
  });

  test("the allNotificationsDismissed action removes all notifications from state when dispatched", () => {
    const testState = {
      ...appInitialState,
      notifications: [
        { id: "ntf1", type: "info", message: "Test Error 1" } as const,
        { id: "ntf2", type: "info", message: "Test Error 2" } as const,
      ],
    };

    const result = appReducer(testState, appActions.allNotificationsDismissed());

    expect(result.notifications).toHaveLength(0);
  });

  test("the notificationShown action creates a new notification = payload when dispatched", () => {
    const result = appReducer(
      appInitialState,
      appActions.notificationShown({ message: "Test Message", type: "info" }),
    );

    const [firstNotification] = result.notifications;

    expect(firstNotification.message).toBe("Test Message");
    expect(firstNotification.type).toBe("info");
    expect(firstNotification.id).toBeDefined();
  });

  describe("sets the correct error message when the errorNotificationShown action is dispatched", () => {
    let consoleError: (...args: any) => void;

    beforeAll(() => {
      consoleError = console.error;
      console.error = () => {
        // Do nothing;
      };
    });

    afterAll(() => {
      console.error = consoleError;
    });

    // prettier-ignore
    const testCases = [
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
        expected: "The following error occurred: Error code 404 when fetching from Clockify API. Status: Error",
      },
      {
        name: "when the error is a Toggl API response",
        payload: {
          ok: false,
          status: 400,
          statusText: "Error",
          url: "/api/toggle/me",
        } as Response,
        expected: "The following error occurred: Error code 400 when fetching from Toggl API. Status: Error",
      },
      {
        name: "when the error is an unknown API response with no status",
        payload: {
          ok: false,
          status: 400,
          statusText: "",
          url: "/api/unknown/me",
        } as Response,
        expected: "The following error occurred: Error code 400 when fetching from unknown API.",
      },
    ];

    for (const testCase of testCases) {
      test.concurrent(testCase.name, async () => {
        const result = appReducer(
          appInitialState,
          appActions.errorNotificationShown(testCase.payload),
        );

        const [firstNotification] = result.notifications;

        expect(firstNotification.message).toBe(testCase.expected);
        expect(firstNotification.type).toBe("error");
        expect(firstNotification.id).toBeDefined();
      });
    }
  });
});
