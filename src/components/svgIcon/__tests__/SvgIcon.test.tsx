import React from "react";
import { render } from "@testing-library/react";
import SvgIcon, { IconName, iconAttributes } from "../SvgIcon";

describe("<SvgIcon> Component", () => {
  test("displays the correct path and color based on props", () => {
    const props = {
      name: "person" as IconName,
      color: "blue",
    };
    const { getByTestId } = render(<SvgIcon {...props} />);
    const innerPath = getByTestId("svg-icon-path");

    expect(innerPath).toHaveAttribute("d", iconAttributes.person.path);
    expect(innerPath).toHaveAttribute("fill", props.color);
  });
});
