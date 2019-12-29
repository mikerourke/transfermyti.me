import React from "react";
import { render } from "@testing-library/react";
import Icon, { IconName, iconAttributes } from "../Icon";

describe("<Icon> Component", () => {
  test("displays the correct path and color based on props", () => {
    const props = {
      name: "heart" as IconName,
      color: "success" as any,
    };
    const { getByTestId } = render(<Icon {...props} />);
    const innerPath = getByTestId("svg-icon-path");

    expect(innerPath).toHaveAttribute("d", iconAttributes.heart.path);
    expect(innerPath).toHaveAttribute("fill", props.color);
  });
});
