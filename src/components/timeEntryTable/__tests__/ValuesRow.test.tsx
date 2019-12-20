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
    const { wrapper } = setup({ isBottomPadded: false });
    expect(wrapper.getByText("TEST")).not.toHaveStyle("padding-bottom: 4px;");
  });

  test("renders with bottom padding when props.isBottomPadded = true", () => {
    const { wrapper } = setup({ isBottomPadded: true });
    expect(wrapper.getByText("TEST")).toHaveStyle("padding-bottom: 4px;");
  });
});
