import React from "react";
import { fireEvent, render, RenderResult } from "~/jestHelpers";
import InclusionsTableTitle from "../InclusionsTableTitle";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    children: "Test Title",
    flipDisabled: false,
    onFlipAreAllIncluded: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<InclusionsTableTitle {...props} />);

  return { props, wrapper };
};

describe("the <InclusionsTableTitle> component", () => {
  test("matches its snapshot with valid props", () => {
    const { wrapper } = setup();

    expect(wrapper.container.firstElementChild).toMatchSnapshot();
  });

  test("does not disable toggle inclusions button if props.flipDisabled is undefined", () => {
    const { wrapper } = setup({ flipDisabled: undefined });

    expect(wrapper.getByRole("button")).not.toHaveAttribute("disabled", "");
  });

  test("disables toggle inclusions button if props.flipDisabled = true", () => {
    const { wrapper } = setup({ flipDisabled: true });

    expect(wrapper.getByRole("button")).toHaveAttribute("disabled", "");
  });

  test("fires props.onFlipAreAllIncluded when toggle inclusions is clicked", () => {
    const { wrapper, props } = setup({ flipDisabled: false });
    fireEvent.click(wrapper.getByRole("button"));

    expect(props.onFlipAreAllIncluded).toHaveBeenCalled();
  });
});
