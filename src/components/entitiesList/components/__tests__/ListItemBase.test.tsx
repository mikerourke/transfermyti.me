import React from "react";
import { render } from "@testing-library/react";
import ListItemBase from "../ListItemBase";

const setup = (propOverrides: any = {}) => {
  const props = {
    height: 36,
    isOmitted: false,
    ...propOverrides,
  };

  const wrapper = render(<ListItemBase {...props} />);

  return { wrapper, props };
};

describe("<ListItemBase> Component", () => {
  test(`is partially transparent if props.isOmitted = true`, () => {
    const { getByTestId } = setup({ isOmitted: true }).wrapper;
    const innerFlex = getByTestId("list-item-base-inner");
    const { opacity } = window.getComputedStyle(innerFlex);

    expect(+opacity).toBeLessThan(1);
  });
});
