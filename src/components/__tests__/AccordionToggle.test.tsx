import React from "react";

import AccordionToggle from "../AccordionToggle";
import { fireEvent, render, RenderResult } from "~/jestHelpers";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    children: "Test Children",
    isExpanded: false,
    onToggle: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<AccordionToggle {...props} />);

  return { props, wrapper };
};

describe("the <AccordionToggle> component", () => {
  test("renders successfully with valid props when props.isExpanded = false", () => {
    const { wrapper } = setup({ isExpanded: false });

    expect(wrapper.queryByText("Test Children")).toBeInTheDocument();
    expect(
      wrapper.getByTitle("Plus Sign", { exact: false }),
    ).toBeInTheDocument();
    expect(wrapper.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  test("renders successfully with valid props when props.isExpanded = true", () => {
    const { wrapper } = setup({ isExpanded: true });

    expect(
      wrapper.getByTitle("Minus Sign", { exact: false }),
    ).toBeInTheDocument();
    expect(wrapper.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  test("fires props.onToggle when the toggle button is clicked", () => {
    const { wrapper, props } = setup({ isExpanded: false });
    fireEvent.click(wrapper.getByRole("button"));

    expect(props.onToggle).toHaveBeenCalledWith(true);
  });
});
