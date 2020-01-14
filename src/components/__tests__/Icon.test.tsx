import React from "react";
import { render, theme } from "~/jestHelpers";
import Icon, { IconName, iconAttributes } from "../Icon";

describe("<Icon> Component", () => {
  test("displays the correct path and color based on props", () => {
    const props = {
      name: "heart" as IconName,
      color: "success" as any,
    };
    const { getByTestId } = render(<Icon {...props} />);
    const innerPath = getByTestId("svg-icon-path");
    const validColor = theme.colors.success.replace(/ /ig, "");

    expect(innerPath).toHaveAttribute("d", iconAttributes.heart.path);
    expect(innerPath).toHaveStyleRule("fill", validColor);
  });
});
