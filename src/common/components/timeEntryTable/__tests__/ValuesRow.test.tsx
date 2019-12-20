import React from "react";
import { render } from "@testing-library/react";
import ValuesRow from "../ValuesRow";

const setup = (propOverrides: any = {}) => {
  const props = {
    isBottomPadded: false,
    ...propOverrides,
  };

  const wrapper = render(
    <ValuesRow {...props}>
      <td>TEST</td>
    </ValuesRow>,
    {
      container: document.createElement("tbody"),
    },
  );

  return { wrapper, props };
};

describe("<ValuesRow> Component", () => {
  test("renders without bottom padding when props.isBottomPadded = false", () => {
    const { getByTestId } = setup({ isBottomPadded: false }).wrapper;
    const valuesRow = getByTestId("time-entry-table-values-row");
    const firstCell = valuesRow.querySelector("td");
    const styles = window.getComputedStyle(firstCell);

    expect(styles["padding-bottom"]).toBe("");
  });

  test("renders with bottom padding when props.isBottomPadded = true", () => {
    const { getByTestId } = setup({ isBottomPadded: true }).wrapper;
    const valuesRow = getByTestId("time-entry-table-values-row");
    const firstCell = valuesRow.querySelector("td");
    const styles = window.getComputedStyle(firstCell);

    expect(styles["padding-bottom"]).toBeDefined();
  });
});
