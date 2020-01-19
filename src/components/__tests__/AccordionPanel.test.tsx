import React from "react";
import { render, RenderResult } from "~/jestHelpers";
import AccordionPanel from "../AccordionPanel";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    children: "Test Children",
    rowNumber: 1,
    title: "Test Title",
    ...propOverrides,
  };

  const wrapper = render(<AccordionPanel {...props} />);

  return { props, wrapper };
};

describe("the <AccordionPanel> component", () => {
  test("matches its snapshot with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });
});
