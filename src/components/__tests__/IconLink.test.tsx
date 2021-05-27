import React from "react";

import IconLink from "../IconLink";
import { render, RenderResult } from "~/jestHelpers";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    iconName: "heart",
    color: "ruby",
    size: 24,
    ...propOverrides,
  };

  const wrapper = render(<IconLink {...props} />);

  return { props, wrapper };
};

describe("the <IconLink> component", () => {
  test("matches its snapshot with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });

  test("uses a default size if props.size is undefined", () => {
    const { wrapper } = setup({ size: undefined });

    expect(wrapper.container.firstElementChild).toHaveStyleRule(
      "width",
      "24px",
    );
    expect(wrapper.container.firstElementChild).toHaveStyleRule(
      "height",
      "24px",
    );
  });
});
