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
} as AnyValid;

describe("within appSelectors", () => {
  test("the notificationsSelector returns state.app.notifications", () => {
    const result = appSelectors.notificationsSelector(state);

    expect(result).toEqual([{ id: "ntf1", type: "info", message: "Test Message" } as const]);
  });
});
