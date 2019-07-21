import React from "react";
import { render } from "@testing-library/react";
import GroupTotalsDisplay from "../GroupTotalsDisplay";

const setup = (propOverrides: any = {}) => {
  const props = {
    label: "Test",
    included: 100,
    total: 300,
    ...propOverrides,
  };

  const wrapper = render(<GroupTotalsDisplay {...props} />);

  return { wrapper, props };
};

describe("<GroupTotalsDisplay> Component", () => {
  test("displays the label in the proper format", () => {
    const {
      wrapper: { getByTestId },
      props,
    } = setup();
    const label = getByTestId("group-totals-display-label");
    const expected = `${props.label} (${props.included}/${props.total})`;

    expect(label).toHaveTextContent(expected);
  });
});
