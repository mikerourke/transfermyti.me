import React from "react";

import { render } from "~/jestHelpers";

import Flex from "../Flex";

describe("the <Flex> component", () => {
  test("renders with the correct attributes based on props", () => {
    const wrapper = render(
      <Flex
        alignContent="center"
        alignItems="flex-start"
        alignSelf="center"
        justifyContent="flex-end"
        justifySelf="self-end"
        flexDirection="row"
        flex={1}
        flexGrow={1}
        flexShrink={1}
        flexWrap="wrap"
      />,
    );
    const flex = wrapper.container.firstElementChild;

    expect(flex).toHaveStyleRule("display", "flex");
    expect(flex).toHaveStyleRule("align-content", "center");
    expect(flex).toHaveStyleRule("align-items", "flex-start");
    expect(flex).toHaveStyleRule("align-self", "center");
    expect(flex).toHaveStyleRule("justify-content", "flex-end");
    expect(flex).toHaveStyleRule("justify-self", "self-end");
    expect(flex).toHaveStyleRule("flex-direction", "row");
    expect(flex).toHaveStyleRule("flex", "1");
    expect(flex).toHaveStyleRule("flex-grow", "1");
    expect(flex).toHaveStyleRule("flex-shrink", "1");
    expect(flex).toHaveStyleRule("flex-wrap", "wrap");
  });

  test(`sets display to "inline-flex" if props.inline = true`, () => {
    const wrapper = render(<Flex inline />);

    expect(wrapper.container.firstElementChild).toHaveStyleRule(
      "display",
      "inline-flex",
    );
  });
});
