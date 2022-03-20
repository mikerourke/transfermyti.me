import Color from "color";
import cases from "jest-in-case";
import React from "react";

import { fireEvent, render, RenderResult, theme } from "~/jestHelpers";

import Button from "../Button";

const setup = (
  propOverrides: any = {},
): { props: any; wrapper: RenderResult } => {
  const props = {
    disabled: false,
    loading: false,
    onClick: jest.fn(),
    ...propOverrides,
  };

  const wrapper = render(<Button {...props} />);

  return { props, wrapper };
};

describe("the <Button> component", () => {
  cases(
    "matches its snapshot based on props.variant",
    (options) => {
      const { wrapper } = setup({ variant: options.variant });

      expect(wrapper.getByRole("button")).toMatchSnapshot();
    },
    [
      {
        name: "when props.variant = default",
        variant: "default",
      },
      {
        name: "when props.variant = eggplant",
        variant: "eggplant",
      },
      {
        name: "when props.variant = outline",
        variant: "outline",
      },
      {
        name: "when props.variant = primary",
        variant: "primary",
      },
      {
        name: "when props.variant = secondary",
        variant: "secondary",
      },
    ],
  );

  test(`uses "default" as variant when props.variant is undefined`, () => {
    const { wrapper } = setup({ variant: undefined });
    const expected = Color(theme.colors.midnight).hex();

    expect(wrapper.getByRole("button")).toHaveStyleRule("background", expected);
  });

  test(`uses false for props.disabled and props.loading if undefined`, () => {
    const { wrapper } = setup({ disabled: undefined, loading: undefined });

    expect(wrapper.getByRole("button")).not.toBeDisabled();
    expect(wrapper.queryByTestId("button-loading")).toBeNull();
  });

  test("disables the button when props.disabled = true", () => {
    const { wrapper } = setup({ disabled: true });

    expect(wrapper.getByRole("button")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  test("shows the loading indicator when props.loading = true", () => {
    const { wrapper } = setup({ loading: true });

    expect(wrapper.queryByTestId("button-loading")).not.toBeNull();
  });

  test("fires props.onClick when the button is clicked", () => {
    const { wrapper, props } = setup();
    fireEvent.click(wrapper.getByRole("button"));

    expect(props.onClick).toHaveBeenCalled();
  });
});
