import * as appSelectors from "../appSelectors";

const state = {
  app: {
    notifications: [{ id: "ntf1", type: "info", message: "Test Message" } as const],
  },
  router: {
    location: {
      pathname: "/select-inclusions",
      search: "",
      hash: "",
      key: "oq49zd",
      query: {},
    },
    action: "PUSH",
  },
} as any;

describe("within appSelectors", () => {
  test("the currentPathSelector returns state.router.location.pathname", () => {
    const result = appSelectors.currentPathSelector(state);

    expect(result).toBe("/select-inclusions");
  });

  test("the notificationsSelector returns state.app.notifications", () => {
    const result = appSelectors.notificationsSelector(state);

    expect(result).toEqual([{ id: "ntf1", type: "info", message: "Test Message" } as const]);
  });
});
