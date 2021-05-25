import React from "react";

import HelpDetails from "../HelpDetails";
import { render, RenderResult } from "~/jestHelpers";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    title: "Test Title",
    children: "Test Contents",
    ...propOverrides,
  };

  const wrapper = render(<HelpDetails {...props} />);

  return { props, wrapper };
};

describe("the <HelpDetails> component", () => {
  test("matches its snapshot with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });

  test("uses a default title if props.title is undefined", () => {
    const { wrapper } = setup({ title: undefined });

    expect(wrapper.getByText("Show/Hide Help")).toBeInTheDocument();
  });
});
