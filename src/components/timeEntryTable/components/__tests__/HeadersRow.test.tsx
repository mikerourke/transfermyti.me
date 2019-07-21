import React from "react";
import { render } from "@testing-library/react";
import HeadersRow from "../HeadersRow";

const setup = (propOverrides: any = {}) => {
  const props = {
    hasTopBorder: false,
    ...propOverrides,
  };

  const wrapper = render(<HeadersRow {...props} />, {
    container: document.createElement("tbody"),
  });

  return { wrapper, props };
};

describe("<HeadersRow> Component", () => {
  test("renders without a top border when props.hasTopBorder = false", () => {
    const { getByTestId } = setup({ hasTopBorder: false }).wrapper;
    const styles = window.getComputedStyle(
      getByTestId("time-entry-table-headers-row"),
    );

    expect(styles["border-top"]).toBe("");
  });

  test("renders with a top border when props.hasTopBorder = true", () => {
    const { getByTestId } = setup({ hasTopBorder: true }).wrapper;
    const styles = window.getComputedStyle(
      getByTestId("time-entry-table-headers-row"),
    );

    expect(styles["border-top"]).toBeDefined();
  });
});
