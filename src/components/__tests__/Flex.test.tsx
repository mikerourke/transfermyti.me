import React from "react";
import { render } from "@testing-library/react";
import Flex from "../Flex";

const setup = (propOverrides: any = {}) => {
  const props = {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    justifySelf: "center",
    direction: "row",
    ...propOverrides,
  };

  const wrapper = render(<Flex {...props} />);

  return { wrapper, props };
};

describe("<Flex> Component", () => {
  test("has the correct styles based on props", () => {
    const { wrapper, props } = setup();
    const innerDiv = wrapper.container.querySelector("div");
    const styles = window.getComputedStyle(innerDiv);

    expect(styles["align-items"]).toBe(props.alignItems);
    expect(styles["align-self"]).toBe(props.alignSelf);
    expect(styles["justify-content"]).toBe(props.justifyContent);
    expect(styles["justify-self"]).toBe(props.justifySelf);
    expect(styles["flex-direction"]).toBe(props.direction);
  });
});
