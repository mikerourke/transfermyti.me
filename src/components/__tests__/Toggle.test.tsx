import React from "react";
import { fireEvent, render, RenderResult } from "~/jestHelpers";
import Toggle from "../Toggle";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    isToggled: false,
    onToggle: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<Toggle {...props} />);

  return { props, wrapper };
};

describe("the <Toggle> component", () => {
  test("matches its snapshot when props.isToggled = true", () => {
    const { wrapper } = setup({ isToggled: true });

    expect(wrapper.getByRole("switch")).toMatchSnapshot();
  });

  test("matches its snapshot when props.isToggled = false", () => {
    const { wrapper } = setup({ isToggled: false });

    expect(wrapper.getByRole("switch")).toMatchSnapshot();
  });

  test("fires props.onToggle when toggled", () => {
    const { wrapper, props } = setup({ isToggled: false });
    fireEvent.click(wrapper.getByRole("switch"));

    expect(props.onToggle).toHaveBeenCalled();
  });
});
