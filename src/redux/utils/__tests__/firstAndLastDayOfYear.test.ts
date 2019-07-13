import { firstAndLastDayOfYear } from "~/redux/utils";

describe("the firstAndLastDayOfYear method", () => {
  test("returns the first and last day of the year with the default format", () => {
    const result = firstAndLastDayOfYear(2019);
    const expected = {
      firstDay: "2019-01-01T00:00:00.000Z",
      lastDay: "2019-12-31T23:59:59.999Z",
    };

    expect(result).toEqual(expected);
  });

  test("returns the first and last day of the year with a custom format", () => {
    const result = firstAndLastDayOfYear(2019, "YYYY-MM-DD");
    const expected = {
      firstDay: "2019-01-01",
      lastDay: "2019-12-31",
    };

    expect(result).toEqual(expected);
  });
});
