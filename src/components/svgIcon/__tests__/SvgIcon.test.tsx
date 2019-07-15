import React from "react";
import { render } from "@testing-library/react";
import { iconProps, SvgIconName } from "../iconProps";
import SvgIcon from "../SvgIcon";

describe("<SvgIcon> Component", () => {
  test(`displays the correct path and color based on props`, () => {
    const props = {
      name: SvgIconName.Person,
      color: "blue",
    };
    const { getByTestId } = render(<SvgIcon {...props} />);
    const innerPath = getByTestId("svg-icon-path");

    expect(innerPath).toHaveAttribute("d", iconProps[props.name].path);
    expect(innerPath).toHaveAttribute("fill", props.color);
  });
});
