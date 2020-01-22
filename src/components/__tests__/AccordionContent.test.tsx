import React from "react";
import { render, RenderResult } from "~/jestHelpers";
import AccordionContent from "../AccordionContent";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    isExpanded: true,
    ...propOverrides,
  };

  const wrapper = render(<AccordionContent {...props} />);

  return { props, wrapper };
};

describe("the <AccordionContent> component", () => {
  test("renders and is visible when props.isExpanded = true", () => {
    const { wrapper } = setup();

    expect(wrapper.getByRole("region")).toBeInTheDocument();
  });

  test("renders and is hidden when props.isExpanded = false", () => {
    const { wrapper } = setup({ isExpanded: false });

    expect(wrapper.queryByRole("region")).toBeNull();
  });
});
